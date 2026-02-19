import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { vi } from 'vitest'

/**
 * Create a NextRequest for testing API routes
 */
export function createRequest(
  method: string,
  url: string = 'http://localhost:3000/api/test',
  options?: {
    body?: Record<string, unknown>
    headers?: Record<string, string>
    searchParams?: Record<string, string>
  }
): NextRequest {
  const reqUrl = new URL(url)
  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach(([k, v]) => reqUrl.searchParams.set(k, v))
  }

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }

  if (options?.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    init.body = JSON.stringify(options.body)
  }

  return new NextRequest(reqUrl, init)
}

/**
 * Create a multipart/form-data request for file upload testing
 */
export function createFormDataRequest(
  url: string = 'http://localhost:3000/api/upload',
  formData: FormData
): NextRequest {
  return new NextRequest(new URL(url), {
    method: 'POST',
    body: formData,
  })
}

/**
 * Mock authenticated user (via next-auth/jwt getToken)
 */
export function mockAuth(user: {
  id: string
  email: string
  name?: string
  role?: string
}) {
  const mockGetToken = getToken as ReturnType<typeof vi.fn>
  mockGetToken.mockResolvedValue({
    id: user.id,
    email: user.email,
    name: user.name || null,
    role: user.role || 'USER',
  })
}

/**
 * Mock session-based auth (getServerSession)
 */
export function mockSession(user: {
  id: string
  email: string
  name?: string
  role?: string
}) {
  const mockGetSession = getServerSession as ReturnType<typeof vi.fn>
  mockGetSession.mockResolvedValue({
    user: {
      id: user.id,
      email: user.email,
      name: user.name || null,
      role: user.role || 'USER',
    },
  })
}

/**
 * Clear all auth mocks (no auth)
 */
export function clearAuth() {
  const mockGetToken = getToken as ReturnType<typeof vi.fn>
  mockGetToken.mockResolvedValue(null)
  const mockGetSession = getServerSession as ReturnType<typeof vi.fn>
  mockGetSession.mockResolvedValue(null)
}

/**
 * Parse JSON response helper
 */
export async function parseResponse(response: Response) {
  const status = response.status
  const data = await response.json()
  return { status, data }
}

/**
 * Test user fixtures
 */
export const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  password: '$2b$10$hashedpassword',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

export const testAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'ADMIN',
  password: '$2b$10$hashedpassword',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

export const testCatalogProduct = {
  id: 'catalog-1',
  name: 'Business Card Starter',
  description: 'A starter business card',
  imageUrl: null,
  oneTimePrice: 29.99,
  monthlyPrice: 0,
  yearlyPrice: 0,
  monthlyServiceFee: 4.99,
  yearlyServiceFee: 49.99,
  type: 'BUSINESS_CARD' as const,
  plan: 'STARTER' as const,
  features: null,
  isActive: true,
  modelUrl: null,
  modelPoster: null,
  colorOptions: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

export const testProduct = {
  id: 'product-1',
  name: 'Business Card Starter',
  type: 'BUSINESS_CARD' as const,
  status: 'ACTIVE' as const,
  activatedAt: new Date('2025-01-02'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ownerId: 'user-1',
  catalogProductId: 'catalog-1',
  businessCardProfileId: 'profile-1',
  redirectItemId: null,
  staticItemId: null,
}

export const testProfile = {
  id: 'profile-1',
  productId: 'product-1',
  slug: 'test-user',
  plan: 'STARTER' as const,
  fullName: 'Test User',
  title: 'Developer',
  company: 'Test Co',
  bio: 'Test bio',
  email: 'test@example.com',
  phone: '+994501234567',
  website: 'https://test.com',
  profilePicture: null,
  profilePictureUrl: null,
  coverImage: null,
  notes: null,
  theme: 'default',
  views: 42,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}
