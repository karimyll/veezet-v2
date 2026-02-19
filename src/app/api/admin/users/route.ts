import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const allUsers = await db.query.users.findMany({
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: desc(users.createdAt),
      })

      return NextResponse.json({ users: allUsers })
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
