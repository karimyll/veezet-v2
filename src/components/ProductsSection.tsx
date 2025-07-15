'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
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

interface ProductsSectionProps {
  products: CatalogProduct[]
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const getProductTypeDisplay = (type: ProductType) => {
    switch (type) {
      case ProductType.BUSINESS_CARD:
        return 'Business Card'
      case ProductType.REDIRECT_ITEM:
        return 'Smart Redirect'
      case ProductType.STATIC_ITEM:
        return 'Static Item'
      default:
        return type
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₼`
  }

  return (
    <section id="products" className="py-32 bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
            Məhsullar
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Sizin üçün hazırlanmış{' '}
            <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              NFC həlləri
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Yüksək keyfiyyətli materiallar və innovativ texnologiya ilə hazırlanmış məhsullarımız
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-8 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  )}
                  {/* Product Type Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                    {getProductTypeDisplay(product.type)}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Birdəfəlik ödəniş</span>
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.oneTimePrice)}</span>
                    </div>
                    
                    {product.monthlyServiceFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Aylıq xidmət</span>
                        <span className="text-lg font-semibold text-gray-700">{formatCurrency(product.monthlyServiceFee)}</span>
                      </div>
                    )}
                    
                    {product.yearlyServiceFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">İllik xidmət</span>
                        <span className="text-lg font-semibold text-gray-700">{formatCurrency(product.yearlyServiceFee)}</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Badge */}
                  {product.plan && (
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 text-xs font-medium rounded-full">
                      {product.plan === BusinessCardPlan.STARTER && '🚀 Starter'}
                      {product.plan === BusinessCardPlan.PROFESSIONAL && '⭐ Professional'}
                      {product.plan === BusinessCardPlan.BUSINESS && '👑 Business'}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/order/${product.id}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                      Sifariş et
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20  rounded-3xl border border-gray-100">
          <div className="bg-white rounded-3xl p-12 text-gray-900">
            <h3 className="text-3xl font-bold mb-4">Xüsusi layihəniz var?</h3>
            <p className="text-xl mb-8 opacity-90">
              Bizim komanda sizin üçün fərdi həllər hazırlamağa hazırdır
            </p>
           
              <a  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 group">
                 Əlaqə saxla
              </a>

          </div>
        </div>
      </div>
    </section>
  )
}
