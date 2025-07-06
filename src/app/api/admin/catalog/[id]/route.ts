import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { ProductType, BusinessCardPlan } from '@prisma/client'

const PRODUCT_TYPES: ProductType[] = ['BUSINESS_CARD', 'REDIRECT_ITEM', 'STATIC_ITEM']
const BUSINESS_CARD_PLANS: BusinessCardPlan[] = ['STARTER', 'PROFESSIONAL', 'BUSINESS']

// GET /api/admin/catalog/[id] - Returns a specific catalog product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (_req: AuthenticatedRequest) => {
    try {
      const { id } = await params

      const catalogProduct = await prisma.catalogProduct.findUnique({
        where: { id }
      })

      if (!catalogProduct) {
        return NextResponse.json(
          { error: 'Catalog product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(catalogProduct)
    } catch (error) {
      console.error('Error fetching catalog product:', error)
      return NextResponse.json(
        { error: 'Failed to fetch catalog product' },
        { status: 500 }
      )
    }
  })
}

// PUT /api/admin/catalog/[id] - Updates an existing catalog product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params
      const body = await req.json()
    const { name, description, oneTimePrice, monthlyServiceFee, type, plan, isActive } = body

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

    const updateData = {
      name,
      description: description || null,
      oneTimePrice: parseFloat(oneTimePrice),
      monthlyServiceFee: parseFloat(monthlyServiceFee),
      yearlyServiceFee: Math.round(yearlyServiceFee * 100) / 100, // Round to 2 decimal places
      type,
      plan: plan || null,
      isActive: isActive !== undefined ? isActive : true
    }

    // Check if product exists
    const existingProduct = await prisma.catalogProduct.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Catalog product not found' },
        { status: 404 }
      )
    }

    const updatedProduct = await prisma.catalogProduct.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(updatedProduct)
    } catch (error) {
      console.error('Error updating catalog product:', error)
      return NextResponse.json(
        { error: 'Failed to update catalog product' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/admin/catalog/[id] - Deletes a catalog product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (_req: AuthenticatedRequest) => {
    try {
      const { id } = await params

      console.log('DELETE request for product ID:', id)
      
      // Check if product exists
      const existingProduct = await prisma.catalogProduct.findUnique({
        where: { id }
      })

      console.log('Existing product found:', existingProduct)

      if (!existingProduct) {
        console.log('Product not found with ID:', id)
        return NextResponse.json(
          { error: 'Catalog product not found' },
          { status: 404 }
        )
      }

      console.log('Attempting to delete product with ID:', id)
      await prisma.catalogProduct.delete({
        where: { id }
      })

      console.log('Product deleted successfully')
      return NextResponse.json({ message: 'Catalog product deleted successfully' })
    } catch (error) {
      console.error('Error deleting catalog product:', error)
      return NextResponse.json(
        { error: `Failed to delete catalog product: ${error}` },
        { status: 500 }
      )
    }
  })
}
