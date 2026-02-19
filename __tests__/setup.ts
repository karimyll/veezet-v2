import { vi } from 'vitest'

// ─── Mock environment variables ──────────────────────────────────────────────
process.env.AUTH_SECRET = 'test-secret-key-for-unit-tests'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-unit-tests'
process.env.AUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.POSTGRES_URL = 'postgres://test:test@localhost:5432/test'
process.env.R2_ENDPOINT = 'https://test.r2.cloudflarestorage.com'
process.env.R2_ACCESS_KEY_ID = 'test-access-key'
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key'
process.env.R2_BUCKET_NAME = 'test-bucket'
process.env.R2_PUBLIC_URL = 'https://r2.test.com'
process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account-id'

// ─── Mock @/lib/auth ────────────────────────────────────────────────────────
// In next-auth v5, auth() is exported from @/lib/auth and returns a session
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// ─── Mock next-auth/jwt (still used in some test helpers) ───────────────────
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

// ─── Mock next-auth ─────────────────────────────────────────────────────────
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}))

// ─── Mock @/db ──────────────────────────────────────────────────────────────
vi.mock('@/db', () => ({
  db: {
    query: {
      users: { findFirst: vi.fn(), findMany: vi.fn() },
      products: { findFirst: vi.fn(), findMany: vi.fn() },
      catalogProducts: { findFirst: vi.fn(), findMany: vi.fn() },
      businessCardProfiles: { findFirst: vi.fn(), findMany: vi.fn() },
      subscriptions: { findFirst: vi.fn(), findMany: vi.fn() },
      payments: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  },
  default: {},
}))

// ─── Mock bcryptjs ──────────────────────────────────────────────────────────
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: vi.fn().mockResolvedValue(true),
}))

// ─── Mock @paralleldrive/cuid2 ─────────────────────────────────────────────
vi.mock('@paralleldrive/cuid2', () => ({
  createId: vi.fn().mockReturnValue('test-cuid-123'),
}))

// ─── Mock @/lib/r2 ─────────────────────────────────────────────────────────
vi.mock('@/lib/r2', () => ({
  uploadFile: vi.fn().mockResolvedValue({ key: 'test-key', url: 'https://r2.test.com/test-key' }),
  uploadProfilePicture: vi.fn().mockResolvedValue({ key: 'profiles/test/avatar.jpg', url: 'https://r2.test.com/profiles/test/avatar.jpg' }),
  uploadProductImage: vi.fn().mockResolvedValue({ key: 'products/test/image.jpg', url: 'https://r2.test.com/products/test/image.jpg' }),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  getSignedFileUrl: vi.fn().mockResolvedValue('https://signed-url.test.com'),
  getPublicUrl: vi.fn().mockReturnValue('https://r2.test.com/test-key'),
  r2: {},
  BUCKET_NAME: 'test-bucket',
}))

// ─── Mock @aws-sdk/client-s3 ───────────────────────────────────────────────
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({ send: vi.fn() })),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
}))

// ─── Mock @aws-sdk/s3-request-presigner ─────────────────────────────────────
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://signed-url.test.com'),
}))
