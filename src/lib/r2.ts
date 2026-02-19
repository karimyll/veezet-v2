import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 client — S3-compatible object storage
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'veezet-assets'
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

export interface UploadResult {
  key: string
  url: string
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<UploadResult> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  }
}

/**
 * Upload a profile picture to R2
 */
export async function uploadProfilePicture(
  file: Buffer | Uint8Array,
  profileId: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `profiles/${profileId}/avatar.${ext}`
  return uploadFile(file, key, contentType)
}

/**
 * Upload a product image to R2
 */
export async function uploadProductImage(
  file: Buffer | Uint8Array,
  productId: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `products/${productId}/image.${ext}`
  return uploadFile(file, key, contentType)
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  )
}

/**
 * Get a signed URL for temporary access to a private file
 */
export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  return getSignedUrl(r2, command, { expiresIn })
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`
}

export { r2, BUCKET_NAME }
