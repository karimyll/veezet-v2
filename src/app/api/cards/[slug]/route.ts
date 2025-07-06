import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      )
    }

    // Find the business card profile by slug
    const profile = await prisma.businessCardProfile.findUnique({
      where: {
        slug: slug
      },
      include: {
        contacts: {
          orderBy: {
            id: 'asc'
          }
        },
        socialLinks: {
          orderBy: {
            id: 'asc'
          }
        },
        additionalLinks: {
          orderBy: {
            id: 'asc'
          }
        },
        Product: {
          include: {
            owner: {
              select: {
                name: true,
                email: true
              }
            },
            catalogProduct: {
              select: {
                name: true,
                plan: true
              }
            }
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Business card not found" },
        { status: 404 }
      )
    }

    // Check if the product is active
    if (!profile.Product || profile.Product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "Business card is not active" },
        { status: 403 }
      )
    }

    // Transform the data for public consumption
    const publicCardData = {
      slug: profile.slug,
      title: profile.title,
      profilePictureUrl: profile.profilePictureUrl,
      notes: profile.notes,
      plan: profile.plan,
      owner: {
        name: profile.Product.owner.name,
        email: profile.Product.owner.email
      },
      contacts: profile.contacts.map(contact => ({
        id: contact.id,
        type: contact.type,
        value: contact.value
      })),
      socialLinks: profile.socialLinks.map(link => ({
        id: link.id,
        name: link.name,
        icon: link.icon,
        url: link.url
      })),
      additionalLinks: profile.additionalLinks.map(link => ({
        id: link.id,
        title: link.title,
        icon: link.icon,
        url: link.url
      })),
      productName: profile.Product.catalogProduct.name
    }

    return NextResponse.json(publicCardData)

  } catch (error) {
    console.error("Error fetching public card data:", error)
    return NextResponse.json(
      { error: "Failed to fetch card data" },
      { status: 500 }
    )
  }
}
