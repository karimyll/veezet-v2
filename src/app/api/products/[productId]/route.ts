import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { db } from '@/db'
import { products, redirectItems, staticItems } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user!.id
      const { productId } = await params
      const body = await req.json()

      if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
      }

      const { targetUrl, description } = body

      const existingProduct = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: { redirectItem: true, staticItem: true },
      })

      if (!existingProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      if (existingProduct.ownerId !== userId) {
        return NextResponse.json({ error: 'Unauthorized - Product does not belong to you' }, { status: 403 })
      }

      if (existingProduct.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Cannot edit inactive product' }, { status: 403 })
      }

      let updatedItem

      if (existingProduct.type === 'REDIRECT_ITEM') {
        if (!targetUrl) {
          return NextResponse.json({ error: 'Target URL is required for redirect items' }, { status: 400 })
        }
        try {
          new URL(targetUrl)
        } catch {
          return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }

        if (existingProduct.redirectItem) {
          const [result] = await db
            .update(redirectItems)
            .set({ targetUrl })
            .where(eq(redirectItems.id, existingProduct.redirectItem.id))
            .returning()
          updatedItem = result
        }
      } else if (existingProduct.type === 'STATIC_ITEM') {
        if (existingProduct.staticItem) {
          const [result] = await db
            .update(staticItems)
            .set({ description: description || null })
            .where(eq(staticItems.id, existingProduct.staticItem.id))
            .returning()
          updatedItem = result
        }
      } else {
        return NextResponse.json(
          { error: 'This endpoint only supports REDIRECT_ITEM and STATIC_ITEM products' },
          { status: 400 }
        )
      }

      return NextResponse.json({ message: 'Product updated successfully', item: updatedItem })
    } catch (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
  })
}
