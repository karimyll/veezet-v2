import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (_req: AuthenticatedRequest) => {
    try {
      // Fetch all business card profiles with their owner info
      const profiles = await prisma.businessCardProfile.findMany({
        select: {
          id: true,
          slug: true,
          fullName: true,
          title: true,
          views: true,
          createdAt: true,
          Product: {
            select: {
              createdAt: true,
              owner: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                }
              }
            }
          }
        }
      })

      // Transform the data to match our interface
      const transformedProfiles = profiles.map((profile: any) => ({
        id: profile.id,
        slug: profile.slug,
        fullName: profile.fullName || profile.title || 'No name',
        title: profile.title || 'No title',
        views: profile.views || 0, // Use real views data from database
        createdAt: profile.Product?.createdAt.toISOString() || new Date().toISOString(),
        owner: {
          id: profile.Product?.owner.id || '',
          email: profile.Product?.owner.email || '',
          name: profile.Product?.owner.name || null,
        }
      }))

      // Sort by views (real data from database)
      const sortedProfiles = transformedProfiles.sort((a: any, b: any) => b.views - a.views)

      // Calculate totals
      const totalProfiles = sortedProfiles.length
      const totalViews = sortedProfiles.reduce((sum: number, profile: any) => sum + profile.views, 0)

      return NextResponse.json({
        profiles: sortedProfiles,
        totalProfiles,
        totalViews,
      })
    } catch (error) {
      console.error('Error fetching profile analytics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile analytics' },
        { status: 500 }
      )
    }
  })
}
