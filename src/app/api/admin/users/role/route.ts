import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { users, type UserRole } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { userId, role } = (await request.json()) as {
        userId: string
        role: UserRole
      }

      if (!userId || !role) {
        return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
      }

      const validRoles: UserRole[] = ['USER', 'ADMIN']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      const [updated] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning()

      if (!updated) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        },
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
