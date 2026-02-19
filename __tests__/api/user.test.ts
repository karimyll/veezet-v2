import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, mockAuth, clearAuth, testUser, testProduct, testProfile, testCatalogProduct } from '../helpers'
import { db } from '@/db'

describe('User API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/me
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/me', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/me/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/me')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return user data when authenticated', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        createdAt: testUser.createdAt,
        updatedAt: testUser.updatedAt,
      } as any)

      const req = createRequest('GET', 'http://localhost:3000/api/me')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.id).toBe('user-1')
      expect(data.email).toBe('test@example.com')
      expect(data.name).toBe('Test User')
      expect(data.role).toBe('USER')
    })

    it('should return 404 if user not found in DB', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)

      const req = createRequest('GET', 'http://localhost:3000/api/me')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/me/products
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/me/products', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/me/products/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/me/products')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return empty array when user has no products', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findMany).mockResolvedValue([])

      const req = createRequest('GET', 'http://localhost:3000/api/me/products')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data).toEqual([])
    })

    it('should return transformed products with nested data', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findMany).mockResolvedValue([
        {
          ...testProduct,
          catalogProduct: testCatalogProduct,
          subscriptions: [{
            id: 'sub-1',
            status: 'ACTIVE',
            price: 4.99,
            billingCycle: 'MONTHLY',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
            createdAt: new Date(),
          }],
          businessCardProfile: {
            ...testProfile,
            contacts: [],
            socialLinks: [],
            additionalLinks: [],
          },
          redirectItem: null,
          staticItem: null,
        },
      ] as any)

      const req = createRequest('GET', 'http://localhost:3000/api/me/products')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('product-1')
      expect(data[0].catalogProduct).toBeDefined()
      expect(data[0].subscription).toBeDefined()
      expect(data[0].profile).toBeDefined()
      expect(data[0].profile.slug).toBe('test-user')
    })
  })
})
