import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFormDataRequest, parseResponse, mockAuth, clearAuth, testUser, testProfile } from '../helpers'
import { db } from '@/db'
import { uploadProfilePicture, uploadProductImage, deleteFile } from '@/lib/r2'

describe('Upload API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/upload
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/upload', () => {
    let POST: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/upload/route')
      POST = mod.POST
    })

    function createTestFile(name = 'test.jpg', type = 'image/jpeg', size = 1024): File {
      const buffer = new ArrayBuffer(size)
      return new File([buffer], name, { type })
    }

    it('should return 401 if not authenticated', async () => {
      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status } = await parseResponse(await POST(req))
      expect(status).toBe(401)
    })

    it('should return 400 if no file provided', async () => {
      mockAuth(testUser)
      const formData = new FormData()
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('No file')
    })

    it('should return 400 for invalid upload type', async () => {
      mockAuth(testUser)
      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'invalid')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid upload type')
    })

    it('should return 400 if targetId is missing', async () => {
      mockAuth(testUser)
      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'profile')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('targetId')
    })

    it('should return 400 for invalid file type', async () => {
      mockAuth(testUser)
      const formData = new FormData()
      formData.append('file', createTestFile('test.pdf', 'application/pdf'))
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid file type')
    })

    it('should return 400 for file too large', async () => {
      mockAuth(testUser)
      const formData = new FormData()
      formData.append('file', createTestFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024))
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('too large')
    })

    it('should return 404 if profile not found for profile upload', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue(undefined)

      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'profile')
      formData.append('targetId', 'nonexistent')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 403 if user does not own the profile', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        ...testProfile,
        product: { ownerId: 'other-user' },
      } as any)

      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(403)
      expect(data.error).toContain('Forbidden')
    })

    it('should upload profile picture successfully', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        ...testProfile,
        profilePicture: null,
        product: { ownerId: testUser.id },
      } as any)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(200)
      expect(data.message).toContain('Profile picture')
      expect(data.key).toBeDefined()
      expect(data.url).toBeDefined()
      expect(uploadProfilePicture).toHaveBeenCalled()
    })

    it('should delete old profile picture before uploading new one', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        ...testProfile,
        profilePicture: 'profiles/profile-1/old-avatar.jpg',
        product: { ownerId: testUser.id },
      } as any)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'profile')
      formData.append('targetId', 'profile-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status } = await parseResponse(await POST(req))
      expect(status).toBe(200)
      expect(deleteFile).toHaveBeenCalledWith('profiles/profile-1/old-avatar.jpg')
    })

    it('should upload product image successfully', async () => {
      mockAuth(testUser)

      const formData = new FormData()
      formData.append('file', createTestFile())
      formData.append('type', 'product')
      formData.append('targetId', 'product-1')

      const req = createFormDataRequest('http://localhost:3000/api/upload', formData)
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(200)
      expect(data.message).toContain('Product image')
      expect(uploadProductImage).toHaveBeenCalled()
    })
  })
})
