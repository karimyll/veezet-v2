import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  return withAdminAuth(req, async (_request: AuthenticatedRequest) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ users })
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })
}
