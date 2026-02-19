import { db } from '@/db'
import { catalogProducts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { ProductType, BusinessCardPlan } from '@/db/schema'
import ClientHomePage from '@/components/ClientHomePage'

interface CatalogProduct {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  oneTimePrice: number
  monthlyServiceFee: number
  yearlyServiceFee: number
  type: ProductType
  plan?: BusinessCardPlan | null
}

// This will be called at build time and on-demand revalidation
async function getCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    const products = await db
      .select()
      .from(catalogProducts)
      .where(eq(catalogProducts.isActive, true))

    return products.map(product => ({
      ...product,
      monthlyServiceFee: product.monthlyServiceFee || 0,
      yearlyServiceFee: product.yearlyServiceFee || 0,
    }))
  } catch (error) {
    console.error('Error fetching catalog products:', error)
    return []
  }
}

// Server Component - runs at build time and during revalidation
export default async function HomePage() {
  const products = await getCatalogProducts()

  return <ClientHomePage initialProducts={products} />
}

// Enable ISR with 5 minute revalidation
export const revalidate = 300 // 5 minutes
