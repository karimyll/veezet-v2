import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { redirectItem: true },
    })

    if (!product || product.type !== 'REDIRECT_ITEM') {
      return NextResponse.json({ error: 'Product not found or not a redirect item' }, { status: 404 })
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL(`/coming-soon?product=${productId}`, request.url))
    }

    if (!product.redirectItem) {
      return NextResponse.json({ error: 'Redirect configuration not found' }, { status: 500 })
    }

    if (!product.redirectItem.targetUrl || product.redirectItem.targetUrl.trim() === '') {
      return NextResponse.redirect(new URL(`/setup-redirect?product=${productId}`, request.url))
    }

    return NextResponse.redirect(product.redirectItem.targetUrl, 307)
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
