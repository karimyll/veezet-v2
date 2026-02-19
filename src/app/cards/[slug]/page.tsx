import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { businessCardProfiles } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import ClientCardPage from '@/components/ClientCardPage'

interface CardPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { slug } = await params

  const profile = await db.query.businessCardProfiles.findFirst({
    where: eq(businessCardProfiles.slug, slug),
    columns: {
      fullName: true,
      title: true,
      company: true,
      bio: true,
      profilePicture: true,
    },
  })

  if (!profile) {
    return { title: 'Kart tapılmadı — Veezet' }
  }

  const title = `${profile.fullName} — Veezet`
  const description =
    profile.bio ||
    `${profile.fullName}${profile.title ? ` | ${profile.title}` : ''}${profile.company ? ` @ ${profile.company}` : ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(profile.profilePicture
        ? { images: [{ url: profile.profilePicture, width: 400, height: 400 }] }
        : {}),
    },
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const { slug } = await params

  const profile = await db.query.businessCardProfiles.findFirst({
    where: eq(businessCardProfiles.slug, slug),
    with: {
      contacts: true,
      socialLinks: true,
      additionalLinks: true,
      product: {
        with: {
          owner: true,
          catalogProduct: true,
        },
      },
    },
  })

  if (!profile || profile.product?.status !== 'ACTIVE') {
    notFound()
  }

  // Increment view count (fire-and-forget)
  db.update(businessCardProfiles)
    .set({ views: sql`${businessCardProfiles.views} + 1` })
    .where(eq(businessCardProfiles.id, profile.id))
    .then(() => {})
    .catch((err: unknown) => console.error('View increment failed:', err))

  const initialCardData = {
    slug: profile.slug,
    title: profile.title ?? null,
    profilePictureUrl: profile.profilePictureUrl ?? null,
    notes: profile.notes ?? null,
    plan: profile.plan,
    owner: {
      name: profile.product.owner.name ?? null,
      email: profile.product.owner.email,
    },
    contacts: (profile.contacts ?? []).map((c: { id: string; type: string; value: string }) => ({
      id: c.id,
      type: c.type,
      value: c.value,
    })),
    socialLinks: (profile.socialLinks ?? []).map((l: { id: string; name: string | null; icon: string | null; url: string }) => ({
      id: l.id,
      name: l.name,
      icon: l.icon,
      url: l.url,
    })),
    additionalLinks: (profile.additionalLinks ?? []).map((l: { id: string; title: string; icon: string | null; url: string }) => ({
      id: l.id,
      title: l.title,
      icon: l.icon,
      url: l.url,
    })),
    productName: profile.product.catalogProduct.name,
  }

  return <ClientCardPage initialCardData={initialCardData} />
}

export async function generateStaticParams() {
  try {
    const profiles = await db.query.businessCardProfiles.findMany({
      columns: { slug: true },
    })

    return profiles.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    // D1 env vars may not be available at build time
    return []
  }
}

export const revalidate = 60
