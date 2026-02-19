import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, mockSession, clearAuth, testUser, testProfile } from '../helpers'
import { db } from '@/db'

describe('Profiles API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/profiles/business-card/[profileId]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/profiles/business-card/[profileId]', () => {
    let GET: (request: Request, context: { params: Promise<{ profileId: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/profiles/business-card/[profileId]/route')
      GET = mod.GET
    })

    it('should return 404 if profile not found', async () => {
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue(undefined)

      const req = createRequest('GET', 'http://localhost:3000/api/profiles/business-card/nonexistent')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ profileId: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return profile data', async () => {
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        ...testProfile,
        contacts: [{ id: 'c1', type: 'EMAIL', value: 'test@example.com', label: null }],
        socialLinks: [],
        additionalLinks: [],
        product: { id: 'product-1', ownerId: 'user-1', status: 'ACTIVE' },
      } as any)

      const req = createRequest('GET', 'http://localhost:3000/api/profiles/business-card/profile-1')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ profileId: 'profile-1' }) })
      )
      expect(status).toBe(200)
      expect(data.profile).toBeDefined()
      expect(data.profile.slug).toBe('test-user')
      expect(data.profile.fullName).toBe('Test User')
      expect(data.profile.contacts).toHaveLength(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/profiles/business-card/[profileId]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('PUT /api/profiles/business-card/[profileId]', () => {
    let PUT: (request: Request, context: { params: Promise<{ profileId: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/profiles/business-card/[profileId]/route')
      PUT = mod.PUT
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('PUT', 'http://localhost:3000/api/profiles/business-card/profile-1', {
        body: { fullName: 'Updated Name' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ profileId: 'profile-1' }) })
      )
      expect(status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should return 404 if profile not found', async () => {
      mockSession(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue(undefined)

      const req = createRequest('PUT', 'http://localhost:3000/api/profiles/business-card/nonexistent', {
        body: { fullName: 'Updated' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ profileId: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 403 if user does not own the profile', async () => {
      mockSession(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        ...testProfile,
        product: { ownerId: 'other-user-id' },
      } as any)

      const req = createRequest('PUT', 'http://localhost:3000/api/profiles/business-card/profile-1', {
        body: { fullName: 'Updated' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ profileId: 'profile-1' }) })
      )
      expect(status).toBe(403)
      expect(data.error).toContain('Forbidden')
    })

    it('should update profile fields successfully', async () => {
      mockSession(testUser)
      // First call: find existing profile (ownership check)
      // Second call: return updated profile
      vi.mocked(db.query.businessCardProfiles.findFirst)
        .mockResolvedValueOnce({
          ...testProfile,
          product: { ownerId: testUser.id },
        } as any)
        .mockResolvedValueOnce({
          ...testProfile,
          fullName: 'Updated Name',
          title: 'Senior Dev',
          contacts: [],
          socialLinks: [],
          additionalLinks: [],
        } as any)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/profiles/business-card/profile-1', {
        body: { fullName: 'Updated Name', title: 'Senior Dev' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ profileId: 'profile-1' }) })
      )
      expect(status).toBe(200)
      expect(data.profile).toBeDefined()
      expect(data.profile.fullName).toBe('Updated Name')
    })

    it('should replace contacts when provided', async () => {
      mockSession(testUser)
      vi.mocked(db.query.businessCardProfiles.findFirst)
        .mockResolvedValueOnce({
          ...testProfile,
          product: { ownerId: testUser.id },
        } as any)
        .mockResolvedValueOnce({
          ...testProfile,
          contacts: [{ id: 'new-c1', type: 'PHONE', value: '+1234567890', label: 'Work' }],
          socialLinks: [],
          additionalLinks: [],
        } as any)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })
      vi.mocked(db.delete as any).mockImplementation(mockDelete)

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })
      vi.mocked(db.insert as any).mockImplementation(mockInsert)

      const req = createRequest('PUT', 'http://localhost:3000/api/profiles/business-card/profile-1', {
        body: {
          contacts: [{ type: 'PHONE', value: '+1234567890', label: 'Work' }],
        },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ profileId: 'profile-1' }) })
      )
      expect(status).toBe(200)
      expect(data.profile.contacts).toHaveLength(1)
    })
  })
})
