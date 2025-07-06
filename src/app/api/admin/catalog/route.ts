import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { ProductType, BusinessCardPlan } from '@prisma/client'

const PRODUCT_TYPES: ProductType[] = ['BUSINESS_CARD', 'REDIRECT_ITEM', 'STATIC_ITEM']
const BUSINESS_CARD_PLANS: BusinessCardPlan[] = ['STARTER', 'PROFESSIONAL', 'BUSINESS']

// GET /api/admin/catalog - Returns all catalog products
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const catalogProducts = await prisma.catalogProduct.findMany({
        where: {
          isActive: true
        }
      })
      return NextResponse.json(catalogProducts)
    } catch (error) {
      console.error('Error fetching catalog products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch catalog products' },
        { status: 500 }
      )
    }
  })
}

// POST /api/admin/catalog - Creates a new catalog product
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json()
      const { name, description, oneTimePrice, monthlyServiceFee, type, plan } = body

      // Validate required fields
      if (!name || !oneTimePrice || !monthlyServiceFee || !type) {
        return NextResponse.json(
          { error: 'Name, one-time price, monthly service fee, and type are required' },
          { status: 400 }
        )
      }

      // Validate product type
      if (!PRODUCT_TYPES.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid product type' },
          { status: 400 }
        )
      }

      // Validate prices
      if (isNaN(parseFloat(oneTimePrice)) || parseFloat(oneTimePrice) <= 0) {
        return NextResponse.json(
          { error: 'One-time price must be a positive number' },
          { status: 400 }
        )
      }

      if (isNaN(parseFloat(monthlyServiceFee)) || parseFloat(monthlyServiceFee) <= 0) {
        return NextResponse.json(
          { error: 'Monthly service fee must be a positive number' },
          { status: 400 }
        )
      }

      // Validate plan if provided (required for business cards)
      if (type === 'BUSINESS_CARD' && plan && !BUSINESS_CARD_PLANS.includes(plan)) {
        return NextResponse.json(
          { error: 'Invalid business card plan' },
          { status: 400 }
        )
      }

      // Auto-calculate yearly service fee (monthly * 12 * 0.90)
      const yearlyServiceFee = parseFloat(monthlyServiceFee) * 12 * 0.90

      const productData = {
        name,
        description: description || null,
        oneTimePrice: parseFloat(oneTimePrice),
        monthlyServiceFee: parseFloat(monthlyServiceFee),
        yearlyServiceFee: Math.round(yearlyServiceFee * 100) / 100, // Round to 2 decimal places
        type,
        plan: plan || null,
        isActive: true
      }

      const catalogProduct = await prisma.catalogProduct.create({
        data: productData
      })
      
      return NextResponse.json(catalogProduct, { status: 201 })
    } catch (error) {
      console.error('Error creating catalog product:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create catalog product', 
          details: { 
            name: error instanceof Error ? error.name : 'Unknown', 
            message: error instanceof Error ? error.message : 'Unknown error'
          } 
        },
        { status: 500 }
      )
    }
  })
}
