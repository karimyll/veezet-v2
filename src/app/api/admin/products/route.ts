import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (_req: AuthenticatedRequest) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          catalogProduct: {
            select: {
              id: true,
              name: true,
              description: true,
              oneTimePrice: true,
              monthlyServiceFee: true,
              yearlyServiceFee: true,
              type: true,
              plan: true,
            },
          },
          subscriptions: {
            select: {
              id: true,
              status: true,
              price: true,
              billingCycle: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get the latest subscription
          },
          businessCardProfile: {
            select: {
              id: true,
              slug: true,
              title: true,
              profilePictureUrl: true,
            },
          },
          redirectItem: {
            select: {
              id: true,
              targetUrl: true,
            },
          },
          staticItem: {
            select: {
              id: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transform the data to match the expected interface
      const transformedProducts = products.map(product => ({
        ...product,
        user: product.owner, // Map owner to user for consistency
        profile: product.businessCardProfile, // Map businessCardProfile to profile
        subscription: product.subscriptions[0] || null, // Get the latest subscription or null
      }))

      return NextResponse.json(transformedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
  })
}
