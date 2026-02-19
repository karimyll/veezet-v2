import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(request: NextRequest) {
  return withAuth(request, async (authenticatedReq: AuthenticatedRequest) => {
    try {
      const { newEmail } = await authenticatedReq.json()

      if (!newEmail || typeof newEmail !== 'string') {
        return NextResponse.json({ error: 'New email is required' }, { status: 400 })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, newEmail.toLowerCase()),
      })

      if (existingUser && existingUser.id !== authenticatedReq.user!.id) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
      }

      const [updatedUser] = await db
        .update(users)
        .set({ email: newEmail.toLowerCase() })
        .where(eq(users.id, authenticatedReq.user!.id))
        .returning({ id: users.id, email: users.email, name: users.name })

      return NextResponse.json({ success: true, message: 'Email updated successfully', user: updatedUser })
    } catch (error) {
      console.error('Failed to update email:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
