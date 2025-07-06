import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog - Returns all active catalog products for public marketplace
export async function GET() {
  try {
    const catalogProducts = await prisma.catalogProduct.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        oneTimePrice: true,
        monthlyServiceFee: true,
        yearlyServiceFee: true,
        type: true,
        plan: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(catalogProducts)
  } catch (error) {
    console.error('Error fetching public catalog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalog products' },
      { status: 500 }
    )
  }
}
