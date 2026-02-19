import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user!.id
      const { currentPassword, newPassword } = await request.json()

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
      }

      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        return NextResponse.json({ error: 'Passwords must be strings' }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, email: true, password: true },
      })

      if (!user || !user.password) {
        return NextResponse.json({ error: 'User not found or password not set' }, { status: 404 })
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password)
      if (isSamePassword) {
        return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 })
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      await db.update(users).set({ password: hashedNewPassword }).where(eq(users.id, userId))

      return NextResponse.json({ success: true, message: 'Password updated successfully' })
    } catch (error) {
      console.error('Failed to update password:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
