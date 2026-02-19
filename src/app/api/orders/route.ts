import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import {
  users,
  catalogProducts,
  products,
  subscriptions,
  payments,
  businessCardProfiles,
  redirectItems,
  staticItems,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { withOptionalAuth, AuthenticatedRequest } from '@/lib/api-auth'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await db.query.businessCardProfiles.findFirst({
      where: eq(businessCardProfiles.slug, slug),
      columns: { id: true },
    })
    if (!existing) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const {
        name,
        email,
        password,
        catalogProductId,
        billingCycle,
        isExistingUser = false,
        profileFor,
        profileName,
        profileTitle,
        profileSlug,
        redirectUrl,
      } = await request.json()

      if (!email || !catalogProductId || !billingCycle) {
        return NextResponse.json({ error: 'Email, product, and billing cycle are required' }, { status: 400 })
      }

      if (!['MONTHLY', 'YEARLY'].includes(billingCycle)) {
        return NextResponse.json({ error: 'Invalid billing cycle. Must be MONTHLY or YEARLY' }, { status: 400 })
      }

      if (!req.user && !password) {
        return NextResponse.json({ error: 'Password is required for new accounts' }, { status: 400 })
      }

      const orderUserEmail = req.user?.email || email
      const orderUserName = req.user?.name || name

      // 1. Get catalog product
      const catalogProduct = await db.query.catalogProducts.findFirst({
        where: eq(catalogProducts.id, catalogProductId),
      })
      if (!catalogProduct || !catalogProduct.isActive) {
        return NextResponse.json({ error: 'Product not found or not active' }, { status: 400 })
      }

      // 2. Handle user
      let user
      if (req.user) {
        user = await db.query.users.findFirst({ where: eq(users.id, req.user.id) })
        if (!user) return NextResponse.json({ error: 'Authenticated user not found' }, { status: 400 })
      } else {
        const existingUser = await db.query.users.findFirst({ where: eq(users.email, orderUserEmail) })
        if (existingUser) {
          if (!password) {
            return NextResponse.json(
              { error: 'An account with this email already exists. Please provide your password or sign in first.' },
              { status: 400 }
            )
          }
          const isPasswordValid = await bcrypt.compare(password, existingUser.password || '')
          if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password for existing account.' }, { status: 400 })
          }
          user = existingUser
        } else {
          const hashedPassword = await bcrypt.hash(password, 10)
          const [newUser] = await db
            .insert(users)
            .values({ email: orderUserEmail, password: hashedPassword, name: orderUserName || null, role: 'USER' })
            .returning()
          user = newUser
        }
      }

      // 3. Create business card profile if applicable
      let businessCardProfile = null
      if (catalogProduct.type === 'BUSINESS_CARD') {
        let finalProfileName = user.name || user.email
        let finalProfileTitle = profileTitle || null

        if (profileFor === 'myself') {
          finalProfileName = profileName || user.name || user.email
          finalProfileTitle = null
        } else if (profileFor === 'business') {
          finalProfileName = profileName || `${user.name || user.email} Business`
          finalProfileTitle = null
        } else if (profileFor === 'someone-else') {
          finalProfileName = profileName || 'Unknown Person'
          finalProfileTitle = profileTitle || null
        } else if (profileName) {
          finalProfileName = profileName
          finalProfileTitle = profileTitle || null
        }

        const slug = profileSlug || generateSlug(finalProfileName)
        const uniqueSlug = await ensureUniqueSlug(slug)
        const profileId = createId()

        const [profile] = await db
          .insert(businessCardProfiles)
          .values({
            id: profileId,
            productId: '', // will be updated after product creation
            slug: uniqueSlug,
            fullName: finalProfileName,
            title: finalProfileTitle || null,
            plan: catalogProduct.plan || 'STARTER',
            profilePictureUrl: null,
            notes: null,
          })
          .returning()
        businessCardProfile = profile
      }

      // 4. Create redirect/static items if applicable
      let redirectItem = null
      if (catalogProduct.type === 'REDIRECT_ITEM') {
        const [item] = await db.insert(redirectItems).values({ targetUrl: redirectUrl || '' }).returning()
        redirectItem = item
      }

      let staticItem = null
      if (catalogProduct.type === 'STATIC_ITEM') {
        const [item] = await db.insert(staticItems).values({ description: null }).returning()
        staticItem = item
      }

      // 5. Create product
      const [product] = await db
        .insert(products)
        .values({
          name: catalogProduct.name,
          type: catalogProduct.type,
          status: 'PENDING_ACTIVATION',
          ownerId: user.id,
          catalogProductId: catalogProduct.id,
          businessCardProfileId: businessCardProfile?.id || null,
          redirectItemId: redirectItem?.id || null,
          staticItemId: staticItem?.id || null,
        })
        .returning()

      // Update profile with the actual productId
      if (businessCardProfile) {
        await db
          .update(businessCardProfiles)
          .set({ productId: product.id })
          .where(eq(businessCardProfiles.id, businessCardProfile.id))
      }

      // 6. Create subscription
      const subscriptionPrice =
        billingCycle === 'YEARLY' ? catalogProduct.yearlyServiceFee || 0 : catalogProduct.monthlyServiceFee || 0

      const [subscription] = await db
        .insert(subscriptions)
        .values({
          status: 'INACTIVE',
          plan: catalogProduct.plan,
          price: subscriptionPrice,
          billingCycle: billingCycle as 'MONTHLY' | 'YEARLY',
          paymentGatewaySubscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
        })
        .returning()

      // 7. Create payment
      const [payment] = await db
        .insert(payments)
        .values({
          amount: catalogProduct.oneTimePrice,
          currency: 'AZN',
          status: 'SUCCESSFUL',
          paymentGatewayTransactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          subscriptionId: subscription.id,
        })
        .returning()

      const result = {
        user: { id: user.id, email: user.email, name: user.name },
        product: { id: product.id, name: product.name, type: product.type, status: product.status },
        subscription: {
          id: subscription.id,
          price: subscription.price,
          billingCycle: subscription.billingCycle,
          status: subscription.status,
        },
        payment: { id: payment.id, amount: payment.amount, currency: payment.currency, status: payment.status },
        profile: businessCardProfile
          ? { id: businessCardProfile.id, slug: businessCardProfile.slug, fullName: businessCardProfile.fullName, title: businessCardProfile.title }
          : null,
        redirectItem: redirectItem ? { id: redirectItem.id, targetUrl: redirectItem.targetUrl } : null,
        staticItem: staticItem ? { id: staticItem.id, description: staticItem.description } : null,
      }

      return NextResponse.json({ message: 'Order created successfully!', order: result }, { status: 201 })
    } catch (error) {
      console.error('Order creation error:', error)
      if (error instanceof Error) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('not found') ||
          error.message.includes('Product not found')
        ) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
      }
      return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 })
    }
  })
}
