import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { catalogProducts } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(_request: NextRequest) {
  try {
    const products = await db
      .select()
      .from(catalogProducts)
      .where(eq(catalogProducts.isActive, true))
      .orderBy(asc(catalogProducts.name))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching marketplace products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
