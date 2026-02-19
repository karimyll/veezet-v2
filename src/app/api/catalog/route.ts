import { NextResponse } from 'next/server'
import { db } from '@/db'
import { catalogProducts } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const products = await db
      .select({
        id: catalogProducts.id,
        name: catalogProducts.name,
        description: catalogProducts.description,
        imageUrl: catalogProducts.imageUrl,
        oneTimePrice: catalogProducts.oneTimePrice,
        monthlyServiceFee: catalogProducts.monthlyServiceFee,
        yearlyServiceFee: catalogProducts.yearlyServiceFee,
        type: catalogProducts.type,
        plan: catalogProducts.plan,
      })
      .from(catalogProducts)
      .where(eq(catalogProducts.isActive, true))
      .orderBy(asc(catalogProducts.name))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching public catalog:', error)
    return NextResponse.json({ error: 'Failed to fetch catalog products' }, { status: 500 })
  }
}
