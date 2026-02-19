import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { catalogProducts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      const product = await db.query.catalogProducts.findFirst({
        where: eq(catalogProducts.id, id),
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ product })
    } catch (error) {
      console.error('Error fetching catalog product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
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

      const updateData: Record<string, unknown> = { updatedAt: new Date() }

      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (type !== undefined) updateData.type = type
      if (plan !== undefined) updateData.plan = plan
      if (features !== undefined) updateData.features = JSON.stringify(features)
      if (oneTimePrice !== undefined) updateData.oneTimePrice = oneTimePrice
      if (monthlyPrice !== undefined) updateData.monthlyPrice = monthlyPrice
      if (yearlyPrice !== undefined) updateData.yearlyPrice = yearlyPrice
      if (isActive !== undefined) updateData.isActive = Boolean(isActive)
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl
      if (modelUrl !== undefined) updateData.modelUrl = modelUrl
      if (modelPoster !== undefined) updateData.modelPoster = modelPoster
      if (colorOptions !== undefined) updateData.colorOptions = JSON.stringify(colorOptions)

      const [updated] = await db
        .update(catalogProducts)
        .set(updateData)
        .where(eq(catalogProducts.id, id))
        .returning()

      if (!updated) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ product: updated })
    } catch (error) {
      console.error('Error updating catalog product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      const [deleted] = await db
        .delete(catalogProducts)
        .where(eq(catalogProducts.id, id))
        .returning()

      if (!deleted) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting catalog product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
