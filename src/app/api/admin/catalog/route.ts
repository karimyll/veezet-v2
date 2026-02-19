import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { catalogProducts } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const products = await db.query.catalogProducts.findMany({
        orderBy: desc(catalogProducts.createdAt),
      })
      return NextResponse.json({ products })
    } catch (error) {
      console.error('Error fetching catalog products:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const body = await request.json()
      const {
        name,
        description,
        type,
        plan,
        features,
        oneTimePrice,
        monthlyPrice,
        yearlyPrice,
        isActive,
        imageUrl,
        modelUrl,
        modelPoster,
        colorOptions,
      } = body

      if (!name || !type) {
        return NextResponse.json({ error: 'name and type are required' }, { status: 400 })
      }

      const [product] = await db
        .insert(catalogProducts)
        .values({
          name,
          description: description || null,
          type,
          plan: plan || 'STARTER',
          features: features ? JSON.stringify(features) : null,
          oneTimePrice: oneTimePrice ?? 0,
          monthlyPrice: monthlyPrice ?? 0,
          yearlyPrice: yearlyPrice ?? 0,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          imageUrl: imageUrl || null,
          modelUrl: modelUrl || null,
          modelPoster: modelPoster || null,
          colorOptions: colorOptions ? JSON.stringify(colorOptions) : null,
        })
        .returning()

      return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
      console.error('Error creating catalog product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
