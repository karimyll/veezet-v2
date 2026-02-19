import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, mockAuth, clearAuth, testUser, testAdmin, testProduct, testCatalogProduct, testProfile } from '../helpers'
import { db } from '@/db'

describe('Admin API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/metrics
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/metrics', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/metrics/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/admin/metrics')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      mockAuth(testUser)
      const req = createRequest('GET', 'http://localhost:3000/api/admin/metrics')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(403)
    })

    it('should return metrics for admin', async () => {
      mockAuth(testAdmin)

      // Metrics route calls db.select().from() (no where) and db.select().from().where()
      // We need .from() to be both thenable (for no-where chains) and have a .where() method
      const createChainResult = (value: unknown[]) => {
        const result = Promise.resolve(value) as any
        result.where = vi.fn().mockReturnValue(Promise.resolve(value))
        result.from = vi.fn().mockImplementation(() => {
          const inner = Promise.resolve(value) as any
          inner.where = vi.fn().mockReturnValue(Promise.resolve(value))
          return inner
        })
        return result
      }

      const countResult = createChainResult([{ count: 5 }])
      const sumResult = createChainResult([{ total: '100.00' }])

      let callCount = 0
      vi.mocked(db.select as any).mockImplementation(() => {
        callCount++
        // Calls 1-5 return count results, calls 6-7 return sum results, call 8 returns count
        if (callCount <= 5) return countResult
        if (callCount <= 7) return sumResult
        return countResult
      })

      const req = createRequest('GET', 'http://localhost:3000/api/admin/metrics')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.metrics).toBeDefined()
      expect(data.metrics.totalUsers).toBeDefined()
      expect(data.metrics.totalProducts).toBeDefined()
      expect(data.metrics.totalRevenue).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/users
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/users', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/users/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/admin/users')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      mockAuth(testUser)
      const req = createRequest('GET', 'http://localhost:3000/api/admin/users')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(403)
    })

    it('should return users list for admin', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.users.findMany).mockResolvedValue([
        { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'USER', createdAt: new Date() },
        { id: 'admin-1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date() },
      ] as any)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/users')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.users).toBeDefined()
      expect(data.users).toHaveLength(2)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/admin/users/role
  // ═══════════════════════════════════════════════════════════════════════════
  describe('PUT /api/admin/users/role', () => {
    let PUT: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/users/role/route')
      PUT = mod.PUT
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('PUT', 'http://localhost:3000/api/admin/users/role', {
        body: { userId: 'user-1', role: 'ADMIN' },
      })
      const { status } = await parseResponse(await PUT(req))
      expect(status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      mockAuth(testUser)
      const req = createRequest('PUT', 'http://localhost:3000/api/admin/users/role', {
        body: { userId: 'user-1', role: 'ADMIN' },
      })
      const { status } = await parseResponse(await PUT(req))
      expect(status).toBe(403)
    })

    it('should return 400 if userId or role missing', async () => {
      mockAuth(testAdmin)
      const req = createRequest('PUT', 'http://localhost:3000/api/admin/users/role', {
        body: { userId: 'user-1' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 for invalid role', async () => {
      mockAuth(testAdmin)
      const req = createRequest('PUT', 'http://localhost:3000/api/admin/users/role', {
        body: { userId: 'user-1', role: 'SUPER_ADMIN' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid role')
    })

    it('should update user role successfully', async () => {
      mockAuth(testAdmin)
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'ADMIN',
            }]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/admin/users/role', {
        body: { userId: 'user-1', role: 'ADMIN' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(200)
      expect(data.user.role).toBe('ADMIN')
    })

    it('should return 404 if user not found', async () => {
      mockAuth(testAdmin)
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/admin/users/role', {
        body: { userId: 'nonexistent', role: 'ADMIN' },
      })
      const { status, data } = await parseResponse(await PUT(req))
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/catalog
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/catalog', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/catalog/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/admin/catalog')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      mockAuth(testUser)
      const req = createRequest('GET', 'http://localhost:3000/api/admin/catalog')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(403)
    })

    it('should return catalog products for admin', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.catalogProducts.findMany).mockResolvedValue([testCatalogProduct] as any)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/catalog')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.products).toBeDefined()
      expect(data.products).toHaveLength(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/admin/catalog
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/admin/catalog', () => {
    let POST: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/catalog/route')
      POST = mod.POST
    })

    it('should return 400 if name or type missing', async () => {
      mockAuth(testAdmin)
      const req = createRequest('POST', 'http://localhost:3000/api/admin/catalog', {
        body: { description: 'A product' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should create catalog product successfully', async () => {
      mockAuth(testAdmin)
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'new-catalog-1',
            name: 'New Product',
            type: 'BUSINESS_CARD',
            plan: 'STARTER',
            isActive: true,
          }]),
        }),
      })
      vi.mocked(db.insert as any).mockImplementation(mockInsert)

      const req = createRequest('POST', 'http://localhost:3000/api/admin/catalog', {
        body: {
          name: 'New Product',
          type: 'BUSINESS_CARD',
          plan: 'STARTER',
          oneTimePrice: 29.99,
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(201)
      expect(data.product).toBeDefined()
      expect(data.product.name).toBe('New Product')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/catalog/[id]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/catalog/[id]', () => {
    let GET: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/catalog/[id]/route')
      GET = mod.GET
    })

    it('should return 404 if product not found', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue(undefined)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/catalog/nonexistent')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ id: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return catalog product by id', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue(testCatalogProduct as any)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/catalog/catalog-1')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ id: 'catalog-1' }) })
      )
      expect(status).toBe(200)
      expect(data.product.id).toBe('catalog-1')
      expect(data.product.name).toBe('Business Card Starter')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/admin/catalog/[id]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('PUT /api/admin/catalog/[id]', () => {
    let PUT: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/catalog/[id]/route')
      PUT = mod.PUT
    })

    it('should update catalog product', async () => {
      mockAuth(testAdmin)
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              ...testCatalogProduct,
              name: 'Updated Name',
              oneTimePrice: 39.99,
            }]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/admin/catalog/catalog-1', {
        body: { name: 'Updated Name', oneTimePrice: 39.99 },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ id: 'catalog-1' }) })
      )
      expect(status).toBe(200)
      expect(data.product.name).toBe('Updated Name')
    })

    it('should return 404 if product not found', async () => {
      mockAuth(testAdmin)
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/admin/catalog/nonexistent', {
        body: { name: 'Updated' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ id: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE /api/admin/catalog/[id]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('DELETE /api/admin/catalog/[id]', () => {
    let DELETE: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/catalog/[id]/route')
      DELETE = mod.DELETE
    })

    it('should delete catalog product', async () => {
      mockAuth(testAdmin)
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([testCatalogProduct]),
        }),
      })
      vi.mocked(db.delete as any).mockImplementation(mockDelete)

      const req = createRequest('DELETE', 'http://localhost:3000/api/admin/catalog/catalog-1')
      const { status, data } = await parseResponse(
        await DELETE(req, { params: Promise.resolve({ id: 'catalog-1' }) })
      )
      expect(status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 404 if product not found', async () => {
      mockAuth(testAdmin)
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })
      vi.mocked(db.delete as any).mockImplementation(mockDelete)

      const req = createRequest('DELETE', 'http://localhost:3000/api/admin/catalog/nonexistent')
      const { status, data } = await parseResponse(
        await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/orders
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/orders', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/orders/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/admin/orders')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      mockAuth(testUser)
      const req = createRequest('GET', 'http://localhost:3000/api/admin/orders')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(403)
    })

    it('should return pending orders for admin', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.products.findMany).mockResolvedValue([
        {
          ...testProduct,
          status: 'PENDING_ACTIVATION',
          catalogProduct: testCatalogProduct,
          owner: testUser,
          subscriptions: [{ id: 'sub-1', billingCycle: 'MONTHLY', price: 4.99 }],
        },
      ] as any)

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      })
      vi.mocked(db.select as any).mockImplementation(mockSelect)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/orders')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.orders).toBeDefined()
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBe(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/products
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/products', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/products/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/admin/products')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return all products for admin', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.products.findMany).mockResolvedValue([
        {
          ...testProduct,
          catalogProduct: testCatalogProduct,
          owner: { id: 'user-1', name: 'Test', email: 'test@example.com' },
          subscriptions: [],
          businessCardProfile: testProfile,
        },
      ] as any)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/products')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.products).toBeDefined()
      expect(data.products).toHaveLength(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/admin/products/[productId]/activate
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/admin/products/[productId]/activate', () => {
    let POST: (request: Request, context: { params: Promise<{ productId: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/products/[productId]/activate/route')
      POST = mod.POST
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/admin/products/product-1/activate')
      const { status } = await parseResponse(
        await POST(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      mockAuth(testUser)
      const req = createRequest('POST', 'http://localhost:3000/api/admin/products/product-1/activate')
      const { status } = await parseResponse(
        await POST(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(403)
    })

    it('should return 404 if product not found', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.products.findFirst).mockResolvedValue(undefined)

      const req = createRequest('POST', 'http://localhost:3000/api/admin/products/nonexistent/activate')
      const { status, data } = await parseResponse(
        await POST(req, { params: Promise.resolve({ productId: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 400 if product already active', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        status: 'ACTIVE',
        catalogProduct: testCatalogProduct,
        owner: testUser,
        redirectItem: null,
        staticItem: null,
        businessCardProfile: testProfile,
      } as any)

      const req = createRequest('POST', 'http://localhost:3000/api/admin/products/product-1/activate')
      const { status, data } = await parseResponse(
        await POST(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(400)
      expect(data.error).toContain('already active')
    })

    it('should activate product successfully', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        status: 'PENDING_ACTIVATION',
        catalogProduct: testCatalogProduct,
        owner: testUser,
        redirectItem: null,
        staticItem: null,
        businessCardProfile: testProfile,
      } as any)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              ...testProduct,
              status: 'ACTIVE',
              activatedAt: new Date(),
            }]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('POST', 'http://localhost:3000/api/admin/products/product-1/activate')
      const { status, data } = await parseResponse(
        await POST(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(200)
      expect(data.message).toContain('activated')
      expect(data.product).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/admin/analytics/profiles
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/admin/analytics/profiles', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/admin/analytics/profiles/route')
      GET = mod.GET
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('GET', 'http://localhost:3000/api/admin/analytics/profiles')
      const { status } = await parseResponse(await GET(req))
      expect(status).toBe(401)
    })

    it('should return profile analytics for admin', async () => {
      mockAuth(testAdmin)
      vi.mocked(db.query.businessCardProfiles.findMany).mockResolvedValue([
        {
          id: 'profile-1',
          slug: 'test-user',
          fullName: 'Test User',
          title: 'Developer',
          company: 'Test Co',
          views: 42,
          createdAt: new Date(),
          product: {
            id: 'product-1',
            status: 'ACTIVE',
            owner: { id: 'user-1', name: 'Test', email: 'test@example.com' },
          },
        },
      ] as any)

      const req = createRequest('GET', 'http://localhost:3000/api/admin/analytics/profiles')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(data.profiles).toBeDefined()
      expect(data.profiles).toHaveLength(1)
      expect(data.summary).toBeDefined()
      expect(data.summary.totalProfiles).toBe(1)
      expect(data.summary.totalViews).toBe(42)
      expect(data.summary.averageViews).toBe(42)
    })
  })
})
