import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/db'
import {
  businessCardProfiles,
  contactInfos,
  socialLinks,
  additionalLinks,
  type ContactType,
} from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params

    const profile = await db.query.businessCardProfiles.findFirst({
      where: eq(businessCardProfiles.id, profileId),
      with: {
        contacts: true,
        socialLinks: true,
        additionalLinks: true,
        product: {
          columns: { id: true, ownerId: true, status: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { profileId } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await db.query.businessCardProfiles.findFirst({
      where: eq(businessCardProfiles.id, profileId),
      with: {
        product: { columns: { ownerId: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (existing.product.ownerId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()

    // Update profile fields
    const {
      fullName,
      title,
      company,
      bio,
      email,
      phone,
      website,
      profilePicture,
      coverImage,
      theme,
      slug,
      contacts,
      socials,
      links,
    } = body

    const profileUpdate: Record<string, unknown> = { updatedAt: now }
    if (fullName !== undefined) profileUpdate.fullName = fullName
    if (title !== undefined) profileUpdate.title = title
    if (company !== undefined) profileUpdate.company = company
    if (bio !== undefined) profileUpdate.bio = bio
    if (email !== undefined) profileUpdate.email = email
    if (phone !== undefined) profileUpdate.phone = phone
    if (website !== undefined) profileUpdate.website = website
    if (profilePicture !== undefined) profileUpdate.profilePicture = profilePicture
    if (coverImage !== undefined) profileUpdate.coverImage = coverImage
    if (theme !== undefined) profileUpdate.theme = theme
    if (slug !== undefined) profileUpdate.slug = slug

    await db
      .update(businessCardProfiles)
      .set(profileUpdate)
      .where(eq(businessCardProfiles.id, profileId))

    // Replace contacts: delete all then insert new
    if (contacts !== undefined) {
      await db.delete(contactInfos).where(eq(contactInfos.profileId, profileId))
      if (Array.isArray(contacts) && contacts.length > 0) {
        await db.insert(contactInfos).values(
          contacts.map((c: { type: string; value: string; label?: string }) => ({
            id: createId(),
            profileId,
            type: c.type as ContactType,
            value: c.value,
            label: c.label || null,
            createdAt: now,
            updatedAt: now,
          }))
        )
      }
    }

    // Replace social links
    if (socials !== undefined) {
      await db.delete(socialLinks).where(eq(socialLinks.profileId, profileId))
      if (Array.isArray(socials) && socials.length > 0) {
        await db.insert(socialLinks).values(
          socials.map(
            (s: { platform: string; url: string; label?: string; icon?: string }) => ({
              id: createId(),
              profileId,
              platform: s.platform,
              url: s.url,
              label: s.label || null,
              icon: s.icon || null,
              createdAt: now,
              updatedAt: now,
            })
          )
        )
      }
    }

    // Replace additional links
    if (links !== undefined) {
      await db.delete(additionalLinks).where(eq(additionalLinks.profileId, profileId))
      if (Array.isArray(links) && links.length > 0) {
        await db.insert(additionalLinks).values(
          links.map(
            (l: { title: string; url: string; description?: string; icon?: string }) => ({
              id: createId(),
              profileId,
              title: l.title,
              url: l.url,
              description: l.description || null,
              icon: l.icon || null,
              createdAt: now,
              updatedAt: now,
            })
          )
        )
      }
    }

    // Fetch updated profile
    const updatedProfile = await db.query.businessCardProfiles.findFirst({
      where: eq(businessCardProfiles.id, profileId),
      with: {
        contacts: true,
        socialLinks: true,
        additionalLinks: true,
      },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
