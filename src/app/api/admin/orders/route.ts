import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get pending orders with pagination
    const [orders, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: ProductStatus.PENDING_ACTIVATION
        },
        include: {
          catalogProduct: {
            select: {
              id: true,
              name: true,
              description: true,
              oneTimePrice: true,
              plan: true,
              type: true
            }
          },
          owner: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          subscriptions: {
            select: {
              id: true,
              billingCycle: true,
              price: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.product.count({
        where: {
          status: ProductStatus.PENDING_ACTIVATION
        }
      })
    ]);

    // Transform the data for frontend consumption
    const transformedOrders = orders.map(order => ({
      id: order.id,
      catalogProduct: {
        id: order.catalogProduct.id,
        name: order.catalogProduct.name,
        description: order.catalogProduct.description,
        price: order.catalogProduct.oneTimePrice,
        plan: order.catalogProduct.plan || 'STARTER',
        type: order.catalogProduct.type
      },
      owner: order.owner,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      subscriptions: order.subscriptions
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
  })
}
