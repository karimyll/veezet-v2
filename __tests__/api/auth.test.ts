import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, clearAuth, testUser } from '../helpers'
import { db } from '@/db'
import bcrypt from 'bcryptjs'

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/auth/login
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/login', () => {
    let POST: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/auth/login/route')
      POST = mod.POST
    })

    it('should return 400 if email is missing', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/auth/login', {
        body: { password: 'password123' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 if password is missing', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/auth/login', {
        body: { email: 'test@example.com' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 401 if user not found', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)
      const req = createRequest('POST', 'http://localhost:3000/api/auth/login', {
        body: { email: 'notfound@example.com', password: 'password123' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(401)
      expect(data.error).toContain('Invalid')
    })

    it('should return 401 if password is invalid', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
      const req = createRequest('POST', 'http://localhost:3000/api/auth/login', {
        body: { email: 'test@example.com', password: 'wrongpassword' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(401)
      expect(data.error).toContain('Invalid')
    })

    it('should return 200 with user on valid credentials', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      const req = createRequest('POST', 'http://localhost:3000/api/auth/login', {
        body: { email: 'test@example.com', password: 'password123' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('test@example.com')
      expect(data.user.id).toBe('user-1')
      expect(data.message).toBe('Login successful')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/auth/register
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/register', () => {
    let POST: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/auth/register/route')
      POST = mod.POST
    })

    it('should return 400 if email is missing', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/auth/register', {
        body: { password: 'password123' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 if password is missing', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/auth/register', {
        body: { email: 'test@example.com' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 if email format is invalid', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/auth/register', {
        body: { email: 'not-an-email', password: 'password123' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('email')
    })

    it('should return 400 if password is too short', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/auth/register', {
        body: { email: 'test@example.com', password: '12345' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('6 characters')
    })

    it('should return 400 if user already exists', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      const req = createRequest('POST', 'http://localhost:3000/api/auth/register', {
        body: { email: 'test@example.com', password: 'password123' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('already exists')
    })

    it('should create user successfully', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'new-user-1',
            email: 'new@example.com',
            name: 'New User',
            createdAt: new Date(),
          }]),
        }),
      })
      vi.mocked(db.insert as any).mockImplementation(mockInsert)

      const req = createRequest('POST', 'http://localhost:3000/api/auth/register', {
        body: { email: 'new@example.com', password: 'password123', name: 'New User' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(200)
      expect(data.message).toContain('created')
      expect(data.user.email).toBe('new@example.com')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/auth/logout
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/logout', () => {
    let POST: () => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/auth/logout/route')
      POST = mod.POST
    })

    it('should return 200 with success message', async () => {
      const { status, data } = await parseResponse(await POST())
      expect(status).toBe(200)
      expect(data.message).toBe('Logout successful')
    })
  })
})
