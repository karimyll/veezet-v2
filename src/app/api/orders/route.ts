import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { withOptionalAuth, AuthenticatedRequest } from "@/lib/api-auth"

// Helper function to generate URL slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Helper function to ensure slug is unique
async function ensureUniqueSlug(tx: any, baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existingProfile = await tx.businessCardProfile.findUnique({
      where: { slug }
    })
    
    if (!existingProfile) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (req: AuthenticatedRequest) => {
    try {
    const {
      // User details (for new users)
      name,
      email,
      password,
      // Order details
      catalogProductId,
      billingCycle, // "MONTHLY" or "YEARLY"
      // Optional: if user is already logged in
      isExistingUser = false,
      // Profile details for business cards
      profileFor, // "myself", "business", or "someone-else"
      profileName,
      profileTitle,
      profileSlug,
      // Redirect URL for redirect items
      redirectUrl
    } = await request.json()

    // Validate required fields
    if (!email || !catalogProductId || !billingCycle) {
      return NextResponse.json(
        { error: "Email, product, and billing cycle are required" },
        { status: 400 }
      )
    }

    // Validate billing cycle
    if (!["MONTHLY", "YEARLY"].includes(billingCycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle. Must be MONTHLY or YEARLY" },
        { status: 400 }
      )
    }

    // For new users, password is required
    if (!req.user && !password) {
      return NextResponse.json(
        { error: "Password is required for new accounts" },
        { status: 400 }
      )
    }

    // Use authenticated user data if available
    const orderUserEmail = req.user?.email || email
    const orderUserName = req.user?.name || name

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the catalog product
      const catalogProduct = await tx.catalogProduct.findUnique({
        where: { id: catalogProductId }
      })

      if (!catalogProduct || !catalogProduct.isActive) {
        throw new Error("Product not found or not active")
      }

      // 2. Handle user creation or validation
      let user
      
      if (req.user) {
        // Use authenticated user
        user = await tx.user.findUnique({
          where: { id: req.user.id }
        })
        if (!user) {
          throw new Error("Authenticated user not found")
        }
      } else {
        // Handle guest user
        const existingUser = await tx.user.findUnique({
          where: { email: orderUserEmail }
        })

        if (existingUser) {
          // If user exists, use the existing user
          user = existingUser
        } else {
          // Create new user
          if (!password) {
            throw new Error("Password is required for new accounts")
          }
          
          const hashedPassword = await bcrypt.hash(password, 10)
          user = await tx.user.create({
            data: {
              email: orderUserEmail,
              password: hashedPassword,
              name: orderUserName || null,
              role: 'USER'
            }
          })
        }
      }

      // 3. Create business card profile if this is a business card product
      let businessCardProfile = null
      if (catalogProduct.type === "BUSINESS_CARD") {
        // Determine profile name and title based on profile selection
        let finalProfileName = user.name || user.email
        let finalProfileTitle = profileTitle || null
        
        if (profileFor === 'myself') {
          // For "myself" selections
          if (profileName) {
            // Guest users who provided their name through profile selection
            finalProfileName = profileName
          } else {
            // Logged-in users selecting "myself"
            finalProfileName = user.name || user.email
          }
          finalProfileTitle = null // No title for "myself" profiles
        } else if (profileFor === 'business') {
          // For business profiles
          finalProfileName = profileName || `${user.name || user.email} Business`
          finalProfileTitle = null // No title for business profiles
        } else if (profileFor === 'someone-else') {
          // For someone-else profiles
          finalProfileName = profileName || "Unknown Person"
          finalProfileTitle = profileTitle || null
        } else if (profileName) {
          // Legacy case - direct profile name provided
          finalProfileName = profileName
          finalProfileTitle = profileTitle || null
        }
        
        // Generate slug
        const slug = profileSlug || generateSlug(finalProfileName)
        
        // Ensure slug is unique
        const uniqueSlug = await ensureUniqueSlug(tx, slug)
        
        businessCardProfile = await tx.businessCardProfile.create({
          data: {
            slug: uniqueSlug,
            title: finalProfileName,
            profilePictureUrl: null,
            notes: finalProfileTitle ? `Vəzifə: ${finalProfileTitle}` : null
          }
        })
      }

      // 4. Create redirect item if this is a redirect product
      let redirectItem = null
      if (catalogProduct.type === "REDIRECT_ITEM") {
        redirectItem = await tx.redirectItem.create({
          data: {
            targetUrl: redirectUrl || "" // Use provided URL or empty string
          }
        })
      }

      // 5. Create the product record
      const product = await tx.product.create({
        data: {
          name: catalogProduct.name,
          type: catalogProduct.type,
          status: "PENDING_ACTIVATION",
          ownerId: user.id,
          catalogProductId: catalogProduct.id,
          businessCardProfileId: businessCardProfile?.id || null,
          redirectItemId: redirectItem?.id || null
        }
      })

      // 6. Determine subscription price based on billing cycle
      const subscriptionPrice = billingCycle === "YEARLY" 
        ? catalogProduct.yearlyServiceFee || 0
        : catalogProduct.monthlyServiceFee || 0

      // 7. Create subscription record
      const subscription = await tx.subscription.create({
        data: {
          status: "INACTIVE", // Will be activated when admin activates the product
          plan: catalogProduct.plan,
          price: subscriptionPrice,
          billingCycle: billingCycle as "MONTHLY" | "YEARLY",
          paymentGatewaySubscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Mock ID
          productId: product.id
        }
      })

      // 8. Create the initial payment record (one-time purchase)
      const payment = await tx.payment.create({
        data: {
          amount: catalogProduct.oneTimePrice,
          currency: "AZN", // or USD, depending on your setup
          status: "SUCCESSFUL", // Simulating successful payment
          paymentGatewayTransactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Mock transaction ID
          subscriptionId: subscription.id
        }
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        product: {
          id: product.id,
          name: product.name,
          type: product.type,
          status: product.status
        },
        subscription: {
          id: subscription.id,
          price: subscription.price,
          billingCycle: subscription.billingCycle,
          status: subscription.status
        },
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        },
        profile: businessCardProfile ? {
          id: businessCardProfile.id,
          slug: businessCardProfile.slug,
          title: businessCardProfile.title,
          profilePictureUrl: businessCardProfile.profilePictureUrl,
          notes: businessCardProfile.notes
        } : null,
        redirectItem: redirectItem ? {
          id: redirectItem.id,
          targetUrl: redirectItem.targetUrl
        } : null
      }
    })

    return NextResponse.json({
      message: "Order created successfully!",
      order: result
    }, { status: 201 })

  } catch (error) {
    console.error("Order creation error:", error)
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("already exists") || 
          error.message.includes("not found") ||
          error.message.includes("Product not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    )
  }
  })
}