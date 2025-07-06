import { prisma } from '@/lib/prisma'
import ClientHomePage from '@/components/ClientHomePage'
import { ProductType, BusinessCardPlan } from '@prisma/client'

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
    const products = await prisma.catalogProduct.findMany({
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
      }
    })

    return products.map(product => ({
      ...product,
      monthlyServiceFee: product.monthlyServiceFee || 0,
      yearlyServiceFee: product.yearlyServiceFee || 0
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
