import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { products, catalogProducts, users, subscriptions } from '@/db/schema'
import { eq, desc, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const offset = (page - 1) * limit

      const orders = await db.query.products.findMany({
        where: eq(products.status, 'PENDING_ACTIVATION'),
        with: {
          catalogProduct: true,
          owner: true,
          subscriptions: true,
        },
        orderBy: desc(products.createdAt),
        limit,
        offset,
      })

      const [totalResult] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.status, 'PENDING_ACTIVATION'))

      const total = totalResult.count

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedOrders = orders.map((order: any) => ({
        id: order.id,
        catalogProduct: {
          id: order.catalogProduct.id,
          name: order.catalogProduct.name,
          description: order.catalogProduct.description,
          price: order.catalogProduct.oneTimePrice,
          plan: order.catalogProduct.plan || 'STARTER',
          type: order.catalogProduct.type,
        },
        owner: { id: order.owner.id, email: order.owner.email, name: order.owner.name },
        status: order.status,
        createdAt: order.createdAt,
        subscriptions: order.subscriptions.slice(0, 1).map((s: any) => ({
          id: s.id,
          billingCycle: s.billingCycle,
          price: s.price,
        })),
      }))

      return NextResponse.json({
        orders: transformedOrders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (error) {
      console.error('Error fetching pending orders:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
