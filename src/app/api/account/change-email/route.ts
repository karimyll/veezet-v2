import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth"

export async function PUT(request: NextRequest) {
  return withAuth(request, async (authenticatedReq: AuthenticatedRequest) => {
    try {
      const { newEmail } = await authenticatedReq.json()

      if (!newEmail || typeof newEmail !== 'string') {
        return NextResponse.json(
          { error: "New email is required" },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        )
      }

      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail.toLowerCase() }
      })

      if (existingUser && existingUser.id !== authenticatedReq.user!.id) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 }
        )
      }

    // Update user email
    const updatedUser = await prisma.user.update({
      where: { id: authenticatedReq.user!.id },
      data: { 
        email: newEmail.toLowerCase(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
      user: updatedUser
    })

  } catch (error) {
    console.error("Failed to update email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
  })
}
