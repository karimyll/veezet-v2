import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, mockAuth, clearAuth, testUser, testAdmin } from '../helpers'
import { db } from '@/db'
import bcrypt from 'bcryptjs'

describe('Account API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/account/change-password
  // ═══════════════════════════════════════════════════════════════════════════
  describe('PUT /api/account/change-password', () => {
    let PUT: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/account/change-password/route')
      PUT = mod.PUT
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { currentPassword: 'old123', newPassword: 'new12345' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(401)
      expect(data.error).toBeDefined()
    })

    it('should return 400 if currentPassword missing', async () => {
      mockAuth(testUser)
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { newPassword: 'new12345' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 if newPassword missing', async () => {
      mockAuth(testUser)
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { currentPassword: 'old123' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 if newPassword is too short', async () => {
      mockAuth(testUser)
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { currentPassword: 'old123', newPassword: '12345' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('6 characters')
    })

    it('should return 400 if current password is incorrect', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never) // currentPassword check fails
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { currentPassword: 'wrongpassword', newPassword: 'new12345' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('incorrect')
    })

    it('should return 400 if new password is same as current', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(true as never)  // currentPassword check passes
        .mockResolvedValueOnce(true as never)  // samePassword check → same
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { currentPassword: 'old123', newPassword: 'old123' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('different')
    })

    it('should update password successfully', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(true as never)  // currentPassword valid
        .mockResolvedValueOnce(false as never) // not same as old
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-password', {
        body: { currentPassword: 'old123', newPassword: 'new12345' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('updated')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/account/change-email
  // ═══════════════════════════════════════════════════════════════════════════
  describe('PUT /api/account/change-email', () => {
    let PUT: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/account/change-email/route')
      PUT = mod.PUT
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-email', {
        body: { newEmail: 'new@example.com' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(401)
      expect(data.error).toBeDefined()
    })

    it('should return 400 if newEmail is missing', async () => {
      mockAuth(testUser)
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-email', {
        body: {},
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 if email format is invalid', async () => {
      mockAuth(testUser)
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-email', {
        body: { newEmail: 'not-valid-email' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('email')
    })

    it('should return 400 if email already in use by another user', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        ...testUser,
        id: 'other-user-id',
        email: 'taken@example.com',
      } as any)
      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-email', {
        body: { newEmail: 'taken@example.com' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('already in use')
    })

    it('should update email successfully', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined) // no existing user with that email
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'user-1', email: 'new@example.com', name: 'Test User',
            }]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/account/change-email', {
        body: { newEmail: 'new@example.com' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('new@example.com')
    })
  })
})
