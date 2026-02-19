import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, mockAuth, clearAuth, testUser, testProduct } from '../helpers'
import { db } from '@/db'

describe('Products API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/products/[productId]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('PUT /api/products/[productId]', () => {
    let PUT: (request: Request, context: { params: Promise<{ productId: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/products/[productId]/route')
      PUT = mod.PUT
    })

    it('should return 401 if not authenticated', async () => {
      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: { targetUrl: 'https://example.com' },
      })
      const { status } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(401)
    })

    it('should return 404 if product not found', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue(undefined)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/nonexistent', {
        body: { targetUrl: 'https://example.com' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 403 if product belongs to another user', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        ownerId: 'other-user',
        type: 'REDIRECT_ITEM',
        redirectItem: { id: 'redirect-1', targetUrl: 'https://old.com' },
        staticItem: null,
      } as any)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: { targetUrl: 'https://example.com' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(403)
      expect(data.error).toContain('Unauthorized')
    })

    it('should return 403 if product is not active', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        status: 'PENDING_ACTIVATION',
        type: 'REDIRECT_ITEM',
        redirectItem: { id: 'redirect-1', targetUrl: 'https://old.com' },
        staticItem: null,
      } as any)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: { targetUrl: 'https://example.com' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(403)
      expect(data.error).toContain('inactive')
    })

    it('should return 400 if targetUrl missing for REDIRECT_ITEM', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        type: 'REDIRECT_ITEM',
        redirectItem: { id: 'redirect-1', targetUrl: 'https://old.com' },
        staticItem: null,
      } as any)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: {},
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(400)
      expect(data.error).toContain('Target URL')
    })

    it('should return 400 if targetUrl is invalid format', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        type: 'REDIRECT_ITEM',
        redirectItem: { id: 'redirect-1', targetUrl: 'https://old.com' },
        staticItem: null,
      } as any)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: { targetUrl: 'not-a-url' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid URL')
    })

    it('should update REDIRECT_ITEM successfully', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        type: 'REDIRECT_ITEM',
        redirectItem: { id: 'redirect-1', targetUrl: 'https://old.com' },
        staticItem: null,
      } as any)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'redirect-1', targetUrl: 'https://new.com' }]),
          }),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: { targetUrl: 'https://new.com' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(200)
      expect(data.message).toContain('updated')
    })

    it('should return 400 for BUSINESS_CARD type', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.products.findFirst).mockResolvedValue({
        ...testProduct,
        type: 'BUSINESS_CARD',
        redirectItem: null,
        staticItem: null,
      } as any)

      const req = createRequest('PUT', 'http://localhost:3000/api/products/product-1', {
        body: { targetUrl: 'https://example.com' },
      })
      const { status, data } = await parseResponse(
        await PUT(req, { params: Promise.resolve({ productId: 'product-1' }) })
      )
      expect(status).toBe(400)
      expect(data.error).toContain('REDIRECT_ITEM')
    })
  })
})
