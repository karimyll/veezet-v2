import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (request: AuthenticatedRequest) => {
    try {
      const { userId, role } = await request.json()
      
      if (!userId || !role) {
        return NextResponse.json(
          { error: 'User ID and role are required' },
          { status: 400 }
        )
      }

      if (!['USER', 'ADMIN'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be USER or ADMIN' },
          { status: 400 }
        )
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: role as 'USER' | 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })    

      return NextResponse.json({ user: updatedUser })
    } catch (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }
  })
}
