"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface CatalogProduct {
  id: string
  name: string
  description: string | null
  oneTimePrice: number
  monthlyServiceFee: number
  yearlyServiceFee: number
  type: string
  plan: string | null
  isActive: boolean
  imageUrl?: string
}

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'type'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/marketplace/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        setError('Failed to load products')
      }
    } catch (_err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₼`
  }

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'BUSINESS_CARD':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
            <path d="M6 8h4v1H6V8zm0 2h6v1H6v-1z"/>
          </svg>
        )
      case 'REDIRECT_ITEM':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        )
      case 'STATIC_ITEM':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        )
    }
  }

  const getProductTypeName = (type: string) => {
    switch (type) {
      case 'BUSINESS_CARD':
        return 'Biznes Kart'
      case 'REDIRECT_ITEM':
        return 'URL Yönləndirmə'
      case 'STATIC_ITEM':
        return 'Statik Məhsul'
      default:
        return type
    }
  }

  const getPlanName = (plan: string | null) => {
    switch (plan) {
      case 'STARTER':
        return 'Başlanğıc'
      case 'PROFESSIONAL':
        return 'Peşəkar'
      case 'BUSINESS':
        return 'Biznes'
      default:
        return plan || '-'
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      if (!product.isActive) return false
      if (filterType !== 'ALL' && product.type !== filterType) return false
      return true
    })
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'price':
          aValue = a.oneTimePrice
          bValue = b.oneTimePrice
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-700 mt-4 text-center">Məhsullar yüklənir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/35 to-blue-300/35 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/25 to-indigo-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/10 via-blue-100/10 to-purple-100/10"></div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/20 border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center group">
                <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  Veezet
                </h1>
                <span className="ml-2 text-sm text-gray-600 bg-white/30 px-2 py-1 rounded-full">Marketplace</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-2xl px-4 py-2">
                    <span className="text-sm font-medium text-gray-800">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="secondary" size="sm" className="backdrop-blur-xl bg-white/30 border border-white/50 hover:bg-white/40">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/signin">
                    <Button variant="secondary" size="sm" className="backdrop-blur-xl bg-white/30 border border-white/50 hover:bg-white/40">
                      Giriş
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="primary" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Qeydiyyat
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl mb-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Məhsul Bazarı
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ən yaxşı rəqəmsal məhsulları kəşf edin və birbaşa sifariş verin
            </p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Növ:</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Bütün məhsullar</option>
                  <option value="BUSINESS_CARD">Biznes Kart</option>
                  <option value="REDIRECT_ITEM">URL Yönləndirmə</option>
                  <option value="STATIC_ITEM">Statik Məhsul</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sıralama:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | 'type')}
                  className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Ad</option>
                  <option value="price">Qiymət</option>
                  <option value="type">Növ</option>
                </select>
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white/50 border border-white/60 rounded-lg hover:bg-white/70 transition-colors"
                title={sortOrder === 'asc' ? 'Azdan çoxa' : 'Çoxdan aza'}
              >
                {sortOrder === 'asc' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            </div>
            
            <span className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-full px-4 py-2 text-sm text-gray-700 font-medium">
              {filteredProducts.length} məhsul
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Məhsul tapılmadı</h4>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hal-hazırda mövcud məhsul yoxdur və ya seçdiyiniz filtrələrə uyğun məhsul mövcud deyil.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl overflow-hidden hover:bg-white/40 hover:border-white/60 transition-all duration-300 group">
                  {/* Product Image/Icon */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-gray-600">
                        {getProductTypeIcon(product.type)}
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                        {getProductTypeName(product.type)}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Plan Badge */}
                    {product.plan && (
                      <div className="mb-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                          {getPlanName(product.plan)} Plan
                        </span>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(product.oneTimePrice)}
                        </span>
                        <span className="text-sm text-gray-600">birdəfəlik</span>
                      </div>
                      
                      {(product.monthlyServiceFee > 0 || product.yearlyServiceFee > 0) && (
                        <div className="text-sm text-gray-600">
                          <p>Xidmət haqqı:</p>
                          {product.monthlyServiceFee > 0 && (
                            <p>• {formatCurrency(product.monthlyServiceFee)} / ay</p>
                          )}
                          {product.yearlyServiceFee > 0 && (
                            <p>• {formatCurrency(product.yearlyServiceFee)} / il</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order Button */}
                    <Link href={`/order/${product.id}`} className="block">
                      <Button 
                        variant="primary" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg transition-all duration-300"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                          Sifariş et
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl mt-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sualınız var?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Məhsullar haqqında əlavə məlumat almaq və ya kömək almaq üçün bizimlə əlaqə saxlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" className="backdrop-blur-xl bg-white/30 border border-white/50 hover:bg-white/40">
                Dəstəklə əlaqə
              </Button>
              <Link href="/">
                <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Ana səhifə
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
