import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { products, businessCardProfiles, redirectItems, staticItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { productId } = await params

      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          catalogProduct: true,
          owner: true,
          redirectItem: true,
          staticItem: true,
          businessCardProfile: true,
        },
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      if (product.status === 'ACTIVE') {
        return NextResponse.json({ error: 'Product is already active' }, { status: 400 })
      }

      const now = new Date()

      // Create business card profile if it doesn't exist
      if (!product.businessCardProfile) {
        const profileId = createId()
        const slug = `${product.owner.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-${profileId.slice(0, 6)}`

        await db.insert(businessCardProfiles).values({
          productId: product.id,
          slug,
          fullName: product.owner.name || '',
          title: '',
          company: '',
          bio: '',
          email: product.owner.email,
          phone: '',
          website: '',
          profilePicture: '',
          coverImage: '',
          theme: 'default',
          views: 0,
          createdAt: now,
          updatedAt: now,
        })
      }

      // Update product status
      const [updated] = await db
        .update(products)
        .set({
          status: 'ACTIVE',
          activatedAt: now,
          updatedAt: now,
        })
        .where(eq(products.id, productId))
        .returning()

      // Update redirect/static items
      if (product.redirectItem) {
        await db
          .update(redirectItems)
          .set({ isActive: true, updatedAt: now })
          .where(eq(redirectItems.id, product.redirectItem.id))
      }
      if (product.staticItem) {
        await db
          .update(staticItems)
          .set({ isActive: true, updatedAt: now })
          .where(eq(staticItems.id, product.staticItem.id))
      }

      return NextResponse.json({
        product: updated,
        message: 'Product activated successfully',
      })
    } catch (error) {
      console.error('Error activating product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
