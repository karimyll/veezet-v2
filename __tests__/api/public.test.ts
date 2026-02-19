import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, testCatalogProduct } from '../helpers'
import { db } from '@/db'

describe('Public API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/catalog
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/catalog', () => {
    let GET: () => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/catalog/route')
      GET = mod.GET
    })

    it('should return catalog products', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: testCatalogProduct.id,
                name: testCatalogProduct.name,
                description: testCatalogProduct.description,
                imageUrl: testCatalogProduct.imageUrl,
                oneTimePrice: testCatalogProduct.oneTimePrice,
                monthlyServiceFee: testCatalogProduct.monthlyServiceFee,
                yearlyServiceFee: testCatalogProduct.yearlyServiceFee,
                type: testCatalogProduct.type,
                plan: testCatalogProduct.plan,
              },
            ]),
          }),
        }),
      })
      vi.mocked(db.select as any).mockImplementation(mockSelect)

      const { status, data } = await parseResponse(await GET())
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Business Card Starter')
      expect(data[0].type).toBe('BUSINESS_CARD')
    })

    it('should return empty array when no products', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      vi.mocked(db.select as any).mockImplementation(mockSelect)

      const { status, data } = await parseResponse(await GET())
      expect(status).toBe(200)
      expect(data).toEqual([])
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/marketplace/products
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/marketplace/products', () => {
    let GET: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/marketplace/products/route')
      GET = mod.GET
    })

    it('should return active marketplace products', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([testCatalogProduct]),
          }),
        }),
      })
      vi.mocked(db.select as any).mockImplementation(mockSelect)

      const req = createRequest('GET', 'http://localhost:3000/api/marketplace/products')
      const { status, data } = await parseResponse(await GET(req))
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0].isActive).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/cards/[slug]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/cards/[slug]', () => {
    let GET: (request: Request, context: { params: Promise<{ slug: string }> }) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/cards/[slug]/route')
      GET = mod.GET
    })

    it('should return 404 if profile not found', async () => {
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue(undefined)

      const req = createRequest('GET', 'http://localhost:3000/api/cards/nonexistent')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ slug: 'nonexistent' }) })
      )
      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 403 if product is not active', async () => {
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        id: 'profile-1',
        slug: 'test-user',
        fullName: 'Test User',
        title: 'Developer',
        profilePictureUrl: null,
        notes: null,
        plan: 'STARTER',
        views: 42,
        contacts: [],
        socialLinks: [],
        additionalLinks: [],
        product: {
          id: 'product-1',
          status: 'PENDING_ACTIVATION',
          owner: { name: 'Test User' },
          catalogProduct: { name: 'Starter Card' },
        },
      } as any)

      const req = createRequest('GET', 'http://localhost:3000/api/cards/test-user')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ slug: 'test-user' }) })
      )
      expect(status).toBe(403)
      expect(data.error).toContain('not active')
    })

    it('should return public card data for active product', async () => {
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue({
        id: 'profile-1',
        slug: 'test-user',
        fullName: 'Test User',
        title: 'Developer',
        profilePictureUrl: 'https://r2.test.com/pic.jpg',
        notes: null,
        plan: 'STARTER',
        views: 42,
        contacts: [{ id: 'c1', type: 'EMAIL', value: 'test@example.com' }],
        socialLinks: [{ id: 's1', name: 'GitHub', icon: 'github', url: 'https://github.com/test' }],
        additionalLinks: [{ id: 'l1', title: 'Portfolio', icon: null, url: 'https://portfolio.com' }],
        product: {
          id: 'product-1',
          status: 'ACTIVE',
          owner: { name: 'Test User' },
          catalogProduct: { name: 'Starter Card' },
        },
      } as any)

      const req = createRequest('GET', 'http://localhost:3000/api/cards/test-user')
      const { status, data } = await parseResponse(
        await GET(req, { params: Promise.resolve({ slug: 'test-user' }) })
      )
      expect(status).toBe(200)
      expect(data.slug).toBe('test-user')
      expect(data.fullName).toBe('Test User')
      expect(data.contacts).toHaveLength(1)
      expect(data.socialLinks).toHaveLength(1)
      expect(data.additionalLinks).toHaveLength(1)
      expect(data.productName).toBe('Starter Card')
    })
  })
})
