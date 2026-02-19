import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { products } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const allProducts = await db.query.products.findMany({
        with: {
          catalogProduct: true,
          owner: {
            columns: { id: true, name: true, email: true },
          },
          subscriptions: true,
          businessCardProfile: true,
        },
        orderBy: desc(products.createdAt),
      })

      return NextResponse.json({ products: allProducts })
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
