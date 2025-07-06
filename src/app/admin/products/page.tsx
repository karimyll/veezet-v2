"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useCachedAPI } from '@/lib/api-cache'

interface AdminProduct {
  id: string
  name: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  catalogProduct: {
    id: string
    name: string
    description: string
    oneTimePrice: number
    monthlyServiceFee: number | null
    yearlyServiceFee: number | null
    type: string
    plan: string | null
  }
  subscription: {
    id: string
    status: string
    price: number
    billingCycle: string
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    createdAt: string
  } | null
  profile: {
    id: string
    slug: string
    title: string | null
    profilePictureUrl: string | null
  } | null
  redirectItem: {
    id: string
    targetUrl: string
  } | null
  staticItem: {
    id: string
    description: string | null
  } | null
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Use cached API hook
  const { data: productsData, loading } = useCachedAPI<AdminProduct[]>(
    '/api/admin/products',
    [session, refreshKey],
    10 // Cache for 10 minutes
  )

  const products = productsData || []

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    if ((session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handleActivateProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Trigger refresh
        setRefreshKey(prev => prev + 1)
      } else {
        const error = await response.json()
        console.error('Failed to activate product:', error)
        alert('Məhsul aktivləşdirilərkən xəta baş verdi: ' + error.error)
      }
    } catch (error) {
      console.error('Error activating product:', error)
      alert('Məhsul aktivləşdirilərkən xəta baş verdi')
    }
  }

  const getProductStatusBadge = (status: string) => {
    const statusStyles = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'PENDING_ACTIVATION': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'INACTIVE': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    const statusLabels = {
      'ACTIVE': 'Aktiv',
      'PENDING_ACTIVATION': 'Aktivləşdirilməyi gözləyir',
      'INACTIVE': 'Deaktiv'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.INACTIVE}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    )
  }

  const getSubscriptionStatusBadge = (status: string) => {
    const statusStyles = {
      'ACTIVE': 'bg-green-50 text-green-700',
      'INACTIVE': 'bg-gray-50 text-gray-700',
      'PAST_DUE': 'bg-red-50 text-red-700',
      'CANCELED': 'bg-gray-50 text-gray-700',
      'TRIALING': 'bg-blue-50 text-blue-700'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.INACTIVE}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₼`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'BUSINESS_CARD':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
            <path d="M6 8h4v1H6V8zm0 2h6v1H6v-1z"/>
          </svg>
        )
      case 'REDIRECT_ITEM':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        )
      case 'STATIC_ITEM':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        )
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      if (filterStatus !== 'ALL' && product.status !== filterStatus) return false
      if (filterType !== 'ALL' && product.type !== filterType) return false
      return true
    })
    .sort((a, b) => {
      let aValue: string | number | Date = a[sortBy as keyof AdminProduct] as string | number | Date
      let bValue: string | number | Date = b[sortBy as keyof AdminProduct] as string | number | Date
      
      // Handle null values
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''
      
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/25 to-indigo-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/10 via-blue-100/10 to-purple-100/10"></div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/20 border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="p-2 rounded-lg hover:bg-white/30 text-gray-700 hover:text-gray-900 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bütün Məhsullar</h1>
                <p className="text-sm text-gray-600">İstifadəçilərin bütün məhsullarını görüntüləyin və idarə edin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-full px-4 py-2 text-sm text-gray-700 font-medium">
                {filteredProducts.length} məhsul
              </span>
              <Link href="/admin">
                <Button variant="secondary" size="sm" className="backdrop-blur-xl bg-white/30 border border-white/50 hover:bg-white/40">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Bütün statuslar</option>
                <option value="ACTIVE">Aktiv</option>
                <option value="PENDING_ACTIVATION">Aktivləşdirilməyi gözləyir</option>
                <option value="INACTIVE">Deaktiv</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Növ:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Bütün növlər</option>
                <option value="BUSINESS_CARD">Biznes Kart</option>
                <option value="REDIRECT_ITEM">Redirect</option>
                <option value="STATIC_ITEM">Statik</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sıralama:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Yaradılma tarixi</option>
                <option value="updatedAt">Son yeniləmə</option>
                <option value="name">Ad</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-white/50 border border-white/60 rounded-lg hover:bg-white/70 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11l-3.293 3.293a1 1 0 001.414 1.414l5-5a1 1 0 000-1.414l-5-5a1 1 0 10-1.414 1.414L13.586 3H3z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17 17a1 1 0 01-1 1H5l3.293-3.293a1 1 0 00-1.414-1.414l-5 5a1 1 0 000 1.414l5 5a1 1 0 001.414-1.414L5.414 17H17z" clipRule="evenodd"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Məhsul tapılmadı</h4>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Seçilmiş filtrələrə uyğun məhsul mövcud deyil.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl p-6 hover:bg-white/40 hover:border-white/60 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                          {getProductTypeIcon(product.type)}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xl font-bold text-gray-900">{product.catalogProduct.name}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            {getProductStatusBadge(product.status)}
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{product.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">İstifadəçi</p>
                          <p className="font-medium text-gray-900">{product.user.name || product.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Product Info */}
                        <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-xl p-4">
                          <h6 className="font-bold text-gray-800 mb-2">Məhsul məlumatı</h6>
                          <p className="text-sm text-gray-600 mb-1">Qiymət: {formatCurrency(product.catalogProduct.oneTimePrice)}</p>
                          <p className="text-sm text-gray-600">Yaradılıb: {formatDate(product.createdAt)}</p>
                        </div>
                        
                        {/* Subscription Info */}
                        <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-xl p-4">
                          <h6 className="font-bold text-gray-800 mb-2">Abunəlik</h6>
                          {product.subscription ? (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                {formatCurrency(product.subscription.price)} / {product.subscription.billingCycle.toLowerCase()}
                              </p>
                              {getSubscriptionStatusBadge(product.subscription.status)}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Abunəlik yoxdur</p>
                          )}
                        </div>
                        
                        {/* Profile Info */}
                        <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-xl p-4">
                          <h6 className="font-bold text-gray-800 mb-2">Profil</h6>
                          {product.profile ? (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Slug: {product.profile.slug}</p>
                              {product.profile.title && (
                                <p className="text-sm text-gray-600">Başlıq: {product.profile.title}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Profil yoxdur</p>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-xl p-4">
                          <h6 className="font-bold text-gray-800 mb-2">Əlavə məlumat</h6>
                          {product.redirectItem && (
                            <p className="text-sm text-gray-600 mb-1">
                              Redirect: {product.redirectItem.targetUrl || 'Təyin edilməyib'}
                            </p>
                          )}
                          {product.staticItem && (
                            <p className="text-sm text-gray-600">
                              Statik: {product.staticItem.description || 'Təsvir yoxdur'}
                            </p>
                          )}
                          {!product.redirectItem && !product.staticItem && (
                            <p className="text-sm text-gray-500">-</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-6">
                      {product.status === 'PENDING_ACTIVATION' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={() => handleActivateProduct(product.id)}
                        >
                          Aktivləşdir
                        </Button>
                      )}
                      
                      {product.status === 'ACTIVE' && product.type === 'BUSINESS_CARD' && product.profile && (
                        <Link href={`/cards/${product.profile.slug}`} target="_blank">
                          <Button variant="secondary" size="sm" className="backdrop-blur-xl bg-white/30 border border-white/50 hover:bg-white/40">
                            İctimai səhifə
                          </Button>
                        </Link>
                      )}
                      
                      {product.status === 'ACTIVE' && product.type === 'REDIRECT_ITEM' && (
                        <Link href={`/redirect/${product.id}`} target="_blank">
                          <Button variant="secondary" size="sm" className="backdrop-blur-xl bg-white/30 border border-white/50 hover:bg-white/40">
                            Redirect test
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
