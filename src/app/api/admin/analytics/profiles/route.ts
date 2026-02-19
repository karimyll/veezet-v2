import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { businessCardProfiles } from '@/db/schema'
import { desc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const profiles = await db.query.businessCardProfiles.findMany({
        columns: {
          id: true,
          slug: true,
          fullName: true,
          title: true,
          company: true,
          views: true,
          createdAt: true,
        },
        with: {
          product: {
            columns: { id: true, status: true },
            with: {
              owner: {
                columns: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: desc(businessCardProfiles.views),
      })

      const totalViews = profiles.reduce((sum, p) => sum + (p.views || 0), 0)

      return NextResponse.json({
        profiles,
        summary: {
          totalProfiles: profiles.length,
          totalViews,
          averageViews: profiles.length ? Math.round(totalViews / profiles.length) : 0,
        },
      })
    } catch (error) {
      console.error('Error fetching profile analytics:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
