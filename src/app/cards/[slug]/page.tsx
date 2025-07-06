import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ClientCardPage from '@/components/ClientCardPage'

interface ContactInfo {
  id: string
  type: string
  value: string
}

interface SocialLink {
  id: string
  name: string
  icon: string | null
  url: string
}

interface AdditionalLink {
  id: string
  title: string
  icon: string | null
  url: string
}

interface PublicCardData {
  slug: string
  title: string | null
  profilePictureUrl: string | null
  notes: string | null
  plan: string
  owner: {
    name: string | null
    email: string
  }
  contacts: ContactInfo[]
  socialLinks: SocialLink[]
  additionalLinks: AdditionalLink[]
  productName: string
}

// Generate static params for all active business card slugs
export async function generateStaticParams() {
  try {
    const profiles = await prisma.businessCardProfile.findMany({
      select: {
        slug: true
      },
      where: {
        Product: {
          status: 'ACTIVE'
        }
      }
    })

    return profiles.map((profile) => ({
      slug: profile.slug
    }))
  } catch (error) {
    console.error('Error generating static params for cards:', error)
    return []
  }
}

// Fetch card data for a specific slug
async function getCardData(slug: string): Promise<PublicCardData | null> {
  try {
    const profile = await prisma.businessCardProfile.findUnique({
      where: { slug },
      include: {
        contacts: true,
        socialLinks: true,
        additionalLinks: true,
        Product: {
          include: {
            owner: {
              select: {
                name: true,
                email: true
              }
            },
            catalogProduct: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!profile || !profile.Product || profile.Product.status !== 'ACTIVE') {
      return null
    }

    return {
      slug: profile.slug,
      title: profile.title,
      profilePictureUrl: profile.profilePictureUrl,
      notes: profile.notes,
      plan: profile.plan,
      owner: {
        name: profile.Product.owner.name,
        email: profile.Product.owner.email
      },
      contacts: profile.contacts.map(contact => ({
        id: contact.id,
        type: contact.type,
        value: contact.value
      })),
      socialLinks: profile.socialLinks.map(link => ({
        id: link.id,
        name: link.name,
        icon: link.icon,
        url: link.url
      })),
      additionalLinks: profile.additionalLinks.map(link => ({
        id: link.id,
        title: link.title,
        icon: link.icon,
        url: link.url
      })),
      productName: profile.Product.catalogProduct?.name || 'Business Card'
    }
  } catch (error) {
    console.error('Error fetching card data:', error)
    return null
  }
}

// Track view for a profile
async function trackView(slug: string) {
  try {
    await prisma.businessCardProfile.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.error('Error tracking view:', error)
  }
}

// Server Component
export default async function PublicCardPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const cardData = await getCardData(params.slug)

  if (!cardData) {
    notFound()
  }

  // Track view in the background (fire and forget)
  trackView(params.slug)

  return <ClientCardPage initialCardData={cardData} />
}

// Enable ISR with 1 hour revalidation for card pages
export const revalidate = 3600 // 1 hour
