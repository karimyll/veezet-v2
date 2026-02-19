import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { db } from '@/db'
import { businessCardProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { uploadProfilePicture, uploadProductImage, deleteFile } from '@/lib/r2'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const type = formData.get('type') as string | null // 'profile' | 'cover' | 'product'
      const targetId = formData.get('targetId') as string | null // profileId or productId

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (!type || !['profile', 'cover', 'product'].includes(type)) {
        return NextResponse.json(
          { error: 'Invalid upload type. Must be "profile", "cover", or "product"' },
          { status: 400 }
        )
      }

      if (!targetId) {
        return NextResponse.json({ error: 'targetId is required' }, { status: 400 })
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const userId = req.user!.id

      if (type === 'profile' || type === 'cover') {
        // Verify profile ownership
        const profile = await db.query.businessCardProfiles.findFirst({
          where: eq(businessCardProfiles.id, targetId),
          with: {
            product: { columns: { ownerId: true } },
          },
        })

        if (!profile) {
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (profile.product.ownerId !== userId && req.user!.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (type === 'profile') {
          // Delete old profile picture if exists
          if (profile.profilePicture) {
            try { await deleteFile(profile.profilePicture) } catch { /* ignore */ }
          }

          const result = await uploadProfilePicture(buffer, targetId, file.type)

          await db
            .update(businessCardProfiles)
            .set({
              profilePicture: result.key,
              profilePictureUrl: result.url,
              updatedAt: new Date(),
            })
            .where(eq(businessCardProfiles.id, targetId))

          return NextResponse.json({
            message: 'Profile picture uploaded successfully',
            key: result.key,
            url: result.url,
          })
        } else {
          // Cover image
          if (profile.coverImage) {
            try { await deleteFile(profile.coverImage) } catch { /* ignore */ }
          }

          const ext = file.type.split('/')[1] || 'jpg'
          const key = `profiles/${targetId}/cover.${ext}`
          const { uploadFile } = await import('@/lib/r2')
          const result = await uploadFile(buffer, key, file.type)

          await db
            .update(businessCardProfiles)
            .set({
              coverImage: result.key,
              updatedAt: new Date(),
            })
            .where(eq(businessCardProfiles.id, targetId))

          return NextResponse.json({
            message: 'Cover image uploaded successfully',
            key: result.key,
            url: result.url,
          })
        }
      } else {
        // Product image upload
        const result = await uploadProductImage(buffer, targetId, file.type)

        return NextResponse.json({
          message: 'Product image uploaded successfully',
          key: result.key,
          url: result.url,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  })
}
