import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { db } from '@/db'
import { products, catalogProducts, subscriptions, payments, businessCardProfiles, contactInfos, socialLinks, additionalLinks, redirectItems, staticItems } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user!.id

      const userProducts = await db.query.products.findMany({
        where: eq(products.ownerId, userId),
        with: {
          catalogProduct: true,
          subscriptions: {
            with: { payments: true },
          },
          businessCardProfile: {
            with: {
              contacts: true,
              socialLinks: true,
              additionalLinks: true,
            },
          },
          redirectItem: true,
          staticItem: true,
        },
        orderBy: desc(products.createdAt),
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedProducts = userProducts.map((product: any) => ({
        id: product.id,
        name: product.name,
        type: product.type,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        catalogProduct: {
          id: product.catalogProduct.id,
          name: product.catalogProduct.name,
          description: product.catalogProduct.description,
          oneTimePrice: product.catalogProduct.oneTimePrice,
          monthlyServiceFee: product.catalogProduct.monthlyServiceFee,
          yearlyServiceFee: product.catalogProduct.yearlyServiceFee,
          type: product.catalogProduct.type,
          plan: product.catalogProduct.plan,
        },
        subscription: product.subscriptions[0]
          ? {
              id: product.subscriptions[0].id,
              status: product.subscriptions[0].status,
              price: product.subscriptions[0].price,
              billingCycle: product.subscriptions[0].billingCycle,
              currentPeriodStart: product.subscriptions[0].currentPeriodStart,
              currentPeriodEnd: product.subscriptions[0].currentPeriodEnd,
              createdAt: product.subscriptions[0].createdAt,
            }
          : null,
        profile: product.businessCardProfile
          ? {
              id: product.businessCardProfile.id,
              slug: product.businessCardProfile.slug,
              fullName: product.businessCardProfile.fullName,
              title: product.businessCardProfile.title,
              profilePictureUrl: product.businessCardProfile.profilePictureUrl,
              notes: product.businessCardProfile.notes,
              contacts: product.businessCardProfile.contacts || [],
              socialLinks: product.businessCardProfile.socialLinks || [],
              additionalLinks: product.businessCardProfile.additionalLinks || [],
            }
          : null,
        redirectItem: product.redirectItem
          ? { id: product.redirectItem.id, targetUrl: product.redirectItem.targetUrl }
          : null,
        staticItem: product.staticItem
          ? { id: product.staticItem.id, description: product.staticItem.description }
          : null,
      }))

      return NextResponse.json(transformedProducts)
    } catch (error) {
      console.error('Error fetching user products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
  })
}
