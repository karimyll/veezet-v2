import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { businessCardProfiles, contactInfos, socialLinks, additionalLinks, products, users, catalogProducts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const profile = await db.query.businessCardProfiles.findFirst({
      where: eq(businessCardProfiles.slug, slug),
      with: {
        contacts: true,
        socialLinks: true,
        additionalLinks: true,
        product: {
          with: {
            owner: true,
            catalogProduct: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    if (!profile.product || profile.product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Business card is not active' }, { status: 403 })
    }

    const publicCardData = {
      slug: profile.slug,
      fullName: profile.fullName,
      title: profile.title,
      profilePictureUrl: profile.profilePictureUrl,
      notes: profile.notes,
      plan: profile.plan,
      views: profile.views,
      owner: { name: profile.product.owner.name },
      contacts: profile.contacts.map((c: { id: string; type: string; value: string }) => ({ id: c.id, type: c.type, value: c.value })),
      socialLinks: profile.socialLinks.map((l: { id: string; name: string | null; icon: string | null; url: string }) => ({ id: l.id, name: l.name, icon: l.icon, url: l.url })),
      additionalLinks: profile.additionalLinks.map((l: { id: string; title: string; icon: string | null; url: string }) => ({ id: l.id, title: l.title, icon: l.icon, url: l.url })),
      productName: profile.product.catalogProduct.name,
    }

    return NextResponse.json(publicCardData)
  } catch (error) {
    console.error('Error fetching public card data:', error)
    return NextResponse.json({ error: 'Failed to fetch card data' }, { status: 500 })
  }
}
