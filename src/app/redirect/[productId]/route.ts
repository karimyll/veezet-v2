import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId

    // Find the product and its associated redirect item
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        redirectItem: true
      }
    })

    // If product doesn't exist or is not a redirect item
    if (!product || product.type !== 'REDIRECT_ITEM') {
      return NextResponse.json(
        { error: "Product not found or not a redirect item" },
        { status: 404 }
      )
    }

    // If product is not active, show a coming soon page
    if (product.status !== 'ACTIVE') {
      return NextResponse.redirect(
        new URL(`/coming-soon?product=${productId}`, request.url)
      )
    }

    // If no redirect item is associated (shouldn't happen, but safety check)
    if (!product.redirectItem) {
      return NextResponse.json(
        { error: "Redirect configuration not found" },
        { status: 500 }
      )
    }

    // If no target URL is set yet, redirect to setup page
    if (!product.redirectItem.targetUrl || product.redirectItem.targetUrl.trim() === "") {
      return NextResponse.redirect(
        new URL(`/setup-redirect?product=${productId}`, request.url)
      )
    }

    // Log the redirect for analytics (optional)
    // You can add analytics tracking here if needed

    // Perform the redirect - HTTP 307 (Temporary Redirect)
    return NextResponse.redirect(product.redirectItem.targetUrl, 307)

  } catch (error) {
    console.error("Redirect error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
