import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user!.id
      const { productId } = params
      const body = await req.json()

      // Validate required fields
      if (!productId) {
        return NextResponse.json(
          { error: "Product ID is required" },
          { status: 400 }
        )
      }

      const { targetUrl, description } = body

      // Check if the product exists and belongs to the user
      const existingProduct = await prisma.product.findUnique({
        where: {
          id: productId
        },
        include: {
          redirectItem: true,
          staticItem: true
        }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }

    if (existingProduct.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - Product does not belong to you" },
        { status: 403 }
      )
    }

    if (existingProduct.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "Cannot edit inactive product" },
        { status: 403 }
      )
    }

    // Update based on product type
    let updatedItem
    
    if (existingProduct.type === 'REDIRECT_ITEM') {
      if (!targetUrl) {
        return NextResponse.json(
          { error: "Target URL is required for redirect items" },
          { status: 400 }
        )
      }

      // Validate URL format
      try {
        new URL(targetUrl)
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        )
      }

      if (existingProduct.redirectItem) {
        updatedItem = await prisma.redirectItem.update({
          where: {
            id: existingProduct.redirectItem.id
          },
          data: {
            targetUrl: targetUrl
          }
        })
      }
    } else if (existingProduct.type === 'STATIC_ITEM') {
      if (existingProduct.staticItem) {
        updatedItem = await prisma.staticItem.update({
          where: {
            id: existingProduct.staticItem.id
          },
          data: {
            description: description || null
          }
        })
      }
    } else {
      return NextResponse.json(
        { error: "This endpoint only supports REDIRECT_ITEM and STATIC_ITEM products" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Product updated successfully",
      item: updatedItem
    })

  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
  })
}
