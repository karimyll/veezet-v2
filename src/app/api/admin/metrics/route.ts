import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { db } from '@/db'
import { users, products, payments, catalogProducts } from '@/db/schema'
import { count, sum, eq, gte, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [totalUsersResult] = await db.select({ count: count() }).from(users)

      const [newUsersResult] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))

      const [totalProductsResult] = await db.select({ count: count() }).from(products)

      const [activeProductsResult] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.status, 'ACTIVE'))

      const [pendingProductsResult] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.status, 'PENDING_ACTIVATION'))

      const [revenueResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(eq(payments.status, 'SUCCESSFUL'))

      const [monthlyRevenueResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(and(eq(payments.status, 'SUCCESSFUL'), gte(payments.createdAt, thirtyDaysAgo)))

      const [catalogCountResult] = await db.select({ count: count() }).from(catalogProducts)

      return NextResponse.json({
        metrics: {
          totalUsers: totalUsersResult.count,
          newUsersThisMonth: newUsersResult.count,
          totalProducts: totalProductsResult.count,
          activeProducts: activeProductsResult.count,
          pendingProducts: pendingProductsResult.count,
          totalRevenue: Number(revenueResult.total) || 0,
          monthlyRevenue: Number(monthlyRevenueResult.total) || 0,
          catalogProducts: catalogCountResult.count,
        },
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
