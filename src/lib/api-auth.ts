import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name?: string | null
    role: string
  }
}

export async function withAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = {
      id: token.id as string,
      email: token.email!,
      name: token.name,
      role: token.role as string || 'USER'
    }

    return handler(authenticatedReq)
  } catch (error) {
    console.error('Authentication error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function withAdminAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  return withAuth(req, async (authenticatedReq) => {
    if (authenticatedReq.user?.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return handler(authenticatedReq)
  })
}

export async function withOptionalAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    const authenticatedReq = req as AuthenticatedRequest
    if (token) {
      authenticatedReq.user = {
        id: token.id as string,
        email: token.email!,
        name: token.name,
        role: token.role as string || 'USER'
      }
    }

    return handler(authenticatedReq)
  } catch (error) {
    console.error('Optional auth error:', error)
    return handler(req as AuthenticatedRequest)
  }
}
