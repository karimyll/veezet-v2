import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (_req: AuthenticatedRequest) => {
    try {
      // Get current month start and end dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch current month metrics in parallel
    const [
      totalUsers,
      activeProducts,
      pendingOrders,
      monthlyRevenue
    ] = await Promise.all([
      // Total Users
      prisma.user.count(),
      
      // Active Products
      prisma.product.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Pending Orders (Products with PENDING_ACTIVATION status)
      prisma.product.count({
        where: {
          status: 'PENDING_ACTIVATION'
        }
      }),
      
      // Monthly Revenue (successful payments in current month)
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESSFUL',
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Additional metrics for dashboard
    const [
      totalProducts,
      totalSubscriptions,
      activeSubscriptions,
      totalBusinessCards,
      totalMessages
    ] = await Promise.all([
      // Total Products
      prisma.product.count(),
      
      // Total Subscriptions
      prisma.subscription.count(),
      
      // Active Subscriptions
      prisma.subscription.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Total Business Cards
      prisma.businessCardProfile.count(),
      
      // Total Messages
      prisma.message.count()
    ]);

    // Fetch last month metrics for growth calculation
    const [
      lastMonthUsers,
      lastMonthProducts,
      lastMonthSubscriptions,
      lastMonthRevenue
    ] = await Promise.all([
      // Users created last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      
      // Products created last month
      prisma.product.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      
      // Subscriptions created last month
      prisma.subscription.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      
      // Revenue from last month
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESSFUL',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const currentMonthUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    const currentMonthProductsCount = await prisma.product.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    const currentMonthSubscriptionsCount = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    const currentMonthRevenueAmount = monthlyRevenue._sum.amount || 0;
    const lastMonthRevenueAmount = lastMonthRevenue._sum.amount || 0;

    const metrics = {
      totalUsers,
      activeProducts,
      pendingOrders,
      monthlyRevenue: currentMonthRevenueAmount,
      totalProducts,
      totalSubscriptions,
      activeSubscriptions,
      totalBusinessCards,
      totalMessages,
      // Growth metrics (compared to previous month)
      monthlyGrowth: {
        users: calculateGrowth(currentMonthUsersCount, lastMonthUsers),
        revenue: calculateGrowth(currentMonthRevenueAmount, lastMonthRevenueAmount),
        products: calculateGrowth(currentMonthProductsCount, lastMonthProducts),
        subscriptions: calculateGrowth(currentMonthSubscriptionsCount, lastMonthSubscriptions)
      }
    };

      return NextResponse.json(metrics);
    } catch (error) {
      console.error('Admin metrics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admin metrics' },
        { status: 500 }
      );
    }
  });
}
