'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Marquee from "react-fast-marquee"
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

interface ClientHomePageProps {
  initialProducts: CatalogProduct[]
}

export default function ClientHomePage({ initialProducts }: ClientHomePageProps) {
  const [products] = useState<CatalogProduct[]>(initialProducts)
  const { data: session } = useSession()

  // Customer logos
  const customerImages = [
    '/img/customers/bda.jpeg',
    '/img/customers/foodcityaz.jpeg',
    '/img/customers/hirelamp.jpg',
    '/img/customers/pashalife.jpeg',
    '/img/customers/sabahhub.jpg',
    '/img/customers/veyseloglu.png',
    '/img/customers/wegroup.jpeg',
    '/img/customers/vapebar.png',
    '/img/customers/technovate.png'
  ]

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
    <div>
      <Navbar />
      <Hero />
      
      {/* Customers Section */}
      <div className="customers mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 text-gray-800">
            Bizim <span style={{ background: 'linear-gradient(to right, #ec4899, #512784, #ef4444, #eab308)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>müştərilərimiz</span> buralardandır...
          </h2>
          <div className="marquee-container">
            <Marquee pauseOnHover={false} speed={50} gradient={false}>
              {customerImages.map((img, idx) => (
                <div key={idx} className="mx-6 sm:mx-8 md:mx-10">
                  <Image
                    src={img}
                    alt={`customer-${idx}`}
                    width={72}
                    height={72}
                    className="object-contain grayscale rounded-lg"
                    style={{ width: "72px", height: "72px" }}
                  />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="advantages py-20 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Liquid Glass Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/35 to-blue-300/35 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-32 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/25 to-indigo-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/10 via-blue-100/10 to-purple-100/10"></div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="advantage-box text-center group h-80">
              <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 h-full flex flex-col justify-center group-hover:brightness-110">
                <div className="advantage-icon mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 group-hover:shadow-xl transition-all duration-500">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">Onlayn ödəmə</h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">Sürətli və təhlükəsiz ödəmə sistemi</p>
              </div>
            </div>
            
            <div className="advantage-box text-center group h-80">
              <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 h-full flex flex-col justify-center group-hover:brightness-110">
                <div className="advantage-icon mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 group-hover:shadow-xl transition-all duration-500">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.06.66L6 19l6-2 3-3.5c1.18-.38 3.36-.44 5-2.4l-.74-1.48C17.5 10.5 17 8 17 8z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">Təbiət dostu</h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">Ekoloji cəhətdən təmiz materiallar</p>
              </div>
            </div>
            
            <div className="advantage-box text-center group h-80">
              <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 h-full flex flex-col justify-center group-hover:brightness-110">
                <div className="advantage-icon mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/30 group-hover:shadow-xl transition-all duration-500">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">Xüsusi dizayn</h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">Sizin üçün fərdi dizayn həlləri</p>
              </div>
            </div>
            
            <div className="advantage-box text-center group h-80">
              <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 h-full flex flex-col justify-center group-hover:brightness-110">
                <div className="advantage-icon mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 group-hover:shadow-xl transition-all duration-500">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">256-bit SSL</h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">Yüksək səviyyəli təhlükəsizlik</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What are Digital Business Cards Section */}
      <div id="features" className="whataredigitalbusinesscards py-20 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            <div className="whataredigitalbusinesscards-left-side flex-1 text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                Yeni nəsil <span className="text-cyan-400">smart</span><br />vizitkartlar<br />nədir?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                100lərlə kağız vizitkartlar əvəzinə bir ədəd NFC dəstəkli smart plastik vizitkart
              </p>
              <a 
                href="#products" 
                className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 group"
              >
                <span>Xüsusiyyətlərə bax</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </a>
            </div>
            <div className="whataredigitalbusinesscards-right-side flex-1">
              <div className="grid grid-cols-2 gap-6">
                {/* Digital Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="w-full h-64">
                    <Image 
                      src="/img/phonewithveezet.png" 
                      alt="Digital profil" 
                      width={300}
                      height={256}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Digital profil</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Bütün şəxsi və şirkət məlumatlarınız bir yerdə.</p>
                  </div>
                </div>

                {/* Instant Sharing Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="w-full h-64">
                    <Image 
                      src="/img/phonewithveezet.png" 
                      alt="Ani paylaşım" 
                      width={300}
                      height={256}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ani paylaşım</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Kontakt məlumatlarınızı bir toxunuşla paylaşın.</p>
                  </div>
                </div>

                {/* Manage Contacts Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="w-full h-64">
                    <Image 
                      src="/img/phonewithveezet.png" 
                      alt="Kontakt idarəsi" 
                      width={300}
                      height={256}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Kontakt idarəsi</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Bütün kontaktlarınız bir yerdə.</p>
                  </div>
                </div>

                {/* Device Support Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="w-full h-64">
                    <Image 
                      src="/img/phonewithveezet.png" 
                      alt="Cihaz dəstəyi" 
                      width={300}
                      height={256}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cihaz dəstəyi</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Həm Android həm də iOS sistemlərində heç bir tətbiq olmadan çalışması.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Model Section */}
      <div className="specialmodel py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="left-side-specialmodel flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="relative group">
                <Image 
                  src="/img/menustand.png" 
                  alt="Menu Stand NFC Product" 
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="relative group">
                <Image 
                  src="/img/instagramchain.png" 
                  alt="Instagram Chain NFC Product" 
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <div className="right-side-specialmodel flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-gray-800 leading-tight">
                Xüsusi NFC <span style={{ background: 'linear-gradient(to right, #f97316, #512784, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>məhsul</span> istəyin var?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                Narahat olma! 3D print texnologiyası ilə istənilən modelinizi çap edib, NFC inteqrasiya edə bilərik!
              </p>
              <a 
                href="#contact" 
                className="inline-flex items-center px-8 py-4 bg-transparent border border-gray-300 hover:border-gray-400 text-gray-800 hover:text-gray-900 font-medium rounded-2xl transition-all duration-300 group"
              >
                <span>Əlaqə saxla</span>
                <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Məhsullarımız
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              NFC texnologiyası ilə hazırlanmış innovativ məhsullar
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Məhsullar yüklənir...</h3>
              <p className="text-gray-600">Zəhmət olmasa bir az gözləyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {getProductTypeDisplay(product.type)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Birdəfəlik ödəmə:</span>
                        <span className="font-bold text-lg text-gray-900">{formatCurrency(product.oneTimePrice)}</span>
                      </div>
                      
                      {product.monthlyServiceFee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Aylıq xidmət:</span>
                          <span className="font-medium text-gray-700">{formatCurrency(product.monthlyServiceFee)}</span>
                        </div>
                      )}
                      
                      {product.yearlyServiceFee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">İllik xidmət:</span>
                          <span className="font-medium text-gray-700">{formatCurrency(product.yearlyServiceFee)}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Button - Always allow ordering */}
                    <Link href={`/order/${product.id}`}>
                      <Button variant="primary" size="md" className="w-full">
                        Satın Al
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
