import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user!.id
      const { profileId } = await params
      const body = await req.json()

      // Validate required fields
      if (!profileId) {
        return NextResponse.json(
          { error: "Profile ID is required" },
          { status: 400 }
        )
      }

    // Check if the profile exists and belongs to the user
    const existingProfile = await prisma.businessCardProfile.findUnique({
      where: {
        id: profileId
      },
      include: {
        Product: {
          select: {
            ownerId: true,
            status: true
          }
        }
      }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    if (!existingProfile.Product || existingProfile.Product.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - Profile does not belong to you" },
        { status: 403 }
      )
    }

    if (existingProfile.Product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "Cannot edit inactive product" },
        { status: 403 }
      )
    }

    // Extract data from request body
    const {
      title,
      profilePictureUrl,
      notes,
      contacts,
      socialLinks,
      additionalLinks
    } = body

    // Update the profile using a transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update the main profile
      const profile = await tx.businessCardProfile.update({
        where: {
          id: profileId
        },
        data: {
          title: title || null,
          profilePictureUrl: profilePictureUrl || null,
          notes: notes || null
        }
      })

      // Update contacts
      if (contacts && Array.isArray(contacts)) {
        // Delete existing contacts
        await tx.contactInfo.deleteMany({
          where: {
            profileId: profileId
          }
        })

        // Create new contacts
        if (contacts.length > 0) {
          await tx.contactInfo.createMany({
            data: contacts.map((contact: any) => ({
              profileId: profileId,
              type: contact.type,
              value: contact.value
            }))
          })
        }
      }

      // Update social links
      if (socialLinks && Array.isArray(socialLinks)) {
        // Delete existing social links
        await tx.socialLink.deleteMany({
          where: {
            profileId: profileId
          }
        })

        // Create new social links
        if (socialLinks.length > 0) {
          await tx.socialLink.createMany({
            data: socialLinks.map((link: any) => ({
              profileId: profileId,
              name: link.name,
              icon: link.icon || null,
              url: link.url
            }))
          })
        }
      }

      // Update additional links
      if (additionalLinks && Array.isArray(additionalLinks)) {
        // Delete existing additional links
        await tx.additionalLink.deleteMany({
          where: {
            profileId: profileId
          }
        })

        // Create new additional links
        if (additionalLinks.length > 0) {
          await tx.additionalLink.createMany({
            data: additionalLinks.map((link: any) => ({
              profileId: profileId,
              title: link.title,
              icon: link.icon || null,
              url: link.url
            }))
          })
        }
      }

      return profile
    })

    // Fetch the complete updated profile
    const completeProfile = await prisma.businessCardProfile.findUnique({
      where: {
        id: profileId
      },
      include: {
        contacts: {
          orderBy: {
            id: 'asc'
          }
        },
        socialLinks: {
          orderBy: {
            id: 'asc'
          }
        },
        additionalLinks: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: completeProfile
    })

  } catch (error) {
    console.error("Error updating business card profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
  })
}
