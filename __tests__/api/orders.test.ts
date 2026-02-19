import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRequest, parseResponse, mockAuth, clearAuth, testUser, testCatalogProduct } from '../helpers'
import { db } from '@/db'
import bcrypt from 'bcryptjs'

describe('Orders API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/orders
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/orders', () => {
    let POST: (request: Request) => Promise<Response>

    beforeEach(async () => {
      const mod = await import('@/app/api/orders/route')
      POST = mod.POST
    })

    it('should return 400 if required fields missing', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: { email: 'test@example.com' },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 for invalid billing cycle', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'test@example.com',
          password: 'password123',
          catalogProductId: 'catalog-1',
          billingCycle: 'WEEKLY',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('billing cycle')
    })

    it('should return 400 if password missing for guest user', async () => {
      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'new@example.com',
          catalogProductId: 'catalog-1',
          billingCycle: 'MONTHLY',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('Password')
    })

    it('should return 400 if catalog product not found', async () => {
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue(undefined)

      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'new@example.com',
          password: 'password123',
          catalogProductId: 'nonexistent',
          billingCycle: 'MONTHLY',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('not found')
    })

    it('should return 400 if catalog product is inactive', async () => {
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue({
        ...testCatalogProduct,
        isActive: false,
      } as any)

      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'new@example.com',
          password: 'password123',
          catalogProductId: 'catalog-1',
          billingCycle: 'MONTHLY',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('not active')
    })

    it('should create order for new user with BUSINESS_CARD product', async () => {
      // Catalog product exists and is active
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue(testCatalogProduct as any)
      // No existing user
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)
      // Slug is unique
      vi.mocked(db.query.businessCardProfiles.findFirst).mockResolvedValue(undefined)

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn()
            .mockResolvedValueOnce([{ id: 'new-user', email: 'new@example.com', name: 'New User', password: '$2b$10$hash' }]) // user
            .mockResolvedValueOnce([{ id: 'profile-1', slug: 'new-user', fullName: 'New User', title: null, plan: 'STARTER' }]) // profile
            .mockResolvedValueOnce([{ id: 'product-1', name: 'Business Card Starter', type: 'BUSINESS_CARD', status: 'PENDING_ACTIVATION' }]) // product
            .mockResolvedValueOnce([{ id: 'sub-1', status: 'INACTIVE', plan: 'STARTER', price: 4.99, billingCycle: 'MONTHLY' }]) // subscription
            .mockResolvedValueOnce([{ id: 'pay-1', amount: 29.99, currency: 'AZN', status: 'SUCCESSFUL' }]), // payment
        }),
      })
      vi.mocked(db.insert as any).mockImplementation(mockInsert)

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      vi.mocked(db.update as any).mockImplementation(mockUpdate)

      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          catalogProductId: 'catalog-1',
          billingCycle: 'MONTHLY',
          profileFor: 'myself',
          profileName: 'New User',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(201)
      expect(data.message).toContain('Order created')
      expect(data.order).toBeDefined()
      expect(data.order.user.email).toBe('new@example.com')
      expect(data.order.product.type).toBe('BUSINESS_CARD')
      expect(data.order.subscription.billingCycle).toBe('MONTHLY')
      expect(data.order.payment.status).toBe('SUCCESSFUL')
      expect(data.order.profile).toBeDefined()
    })

    it('should create order for authenticated user', async () => {
      mockAuth(testUser)
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue({
        ...testCatalogProduct,
        type: 'REDIRECT_ITEM',
      } as any)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn()
            .mockResolvedValueOnce([{ id: 'redirect-1', targetUrl: 'https://example.com' }]) // redirect item
            .mockResolvedValueOnce([{ id: 'product-2', name: 'Redirect Item', type: 'REDIRECT_ITEM', status: 'PENDING_ACTIVATION' }]) // product
            .mockResolvedValueOnce([{ id: 'sub-2', status: 'INACTIVE', plan: 'STARTER', price: 4.99, billingCycle: 'YEARLY' }]) // subscription
            .mockResolvedValueOnce([{ id: 'pay-2', amount: 29.99, currency: 'AZN', status: 'SUCCESSFUL' }]), // payment
        }),
      })
      vi.mocked(db.insert as any).mockImplementation(mockInsert)

      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'test@example.com',
          catalogProductId: 'catalog-1',
          billingCycle: 'YEARLY',
          redirectUrl: 'https://example.com',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(201)
      expect(data.order.redirectItem).toBeDefined()
    })

    it('should return 400 if existing user provides wrong password', async () => {
      vi.mocked(db.query.catalogProducts.findFirst).mockResolvedValue(testCatalogProduct as any)
      vi.mocked(db.query.users.findFirst).mockResolvedValue(testUser as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const req = createRequest('POST', 'http://localhost:3000/api/orders', {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
          catalogProductId: 'catalog-1',
          billingCycle: 'MONTHLY',
        },
      })
      const { status, data } = await parseResponse(await POST(req))
      expect(status).toBe(400)
      expect(data.error).toContain('Invalid password')
    })
  })
})
