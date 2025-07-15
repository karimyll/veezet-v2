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
import DigitalBusinessCardsSection from '@/components/DigitalBusinessCardsSection'
import SpecialModelSection from '@/components/SpecialModelSection'
import ProductsSection from '@/components/ProductsSection'

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

  return (
    <div>
      <Navbar />
      <Hero />
      
      {/* Customers Section - Enhanced with design system */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              Güvənilən Marka
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Bizim <span style={{
                background: 'linear-gradient(to right, #ec4899, #512784, #ef4444, #eab308)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>müştərilərimiz</span>
              <br />buralardandır...
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Azərbaycanın ən böyük brendləri bizə güvənir və NFC texnologiyasından faydalanır
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none"></div>
            <Marquee pauseOnHover={false} speed={50} gradient={false}>
              {customerImages.map((img, idx) => (
                <div key={idx} className="mx-6 sm:mx-8 md:mx-10">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={img}
                      alt={`customer-${idx}`}
                      width={72}
                      height={72}
                      className="object-contain grayscale hover:grayscale-0 transition-all duration-300 rounded-lg"
                      style={{ width: "60px", height: "60px" }}
                    />
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* Value Proposition Section - New Enhanced Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-cyan-50/50"></div>
        
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full text-cyan-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                  Niyə Veezet?
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Gələcəyin biznes<br />
                  <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    əlaqə həlli
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Kağız vizitkartlar keçmişdə qaldı. NFC texnologiyası ilə kontakt məlumatlarınızı bir toxunuşla paylaşın və həmişə əlaqədə qalın.
                </p>
              </div>
              

            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Onlayn ödəmə</h3>
                <p className="text-gray-600">Sürətli və təhlükəsiz ödəmə sistemi ilə rahat alış-veriş təcrübəsi</p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Təbiət dostu</h3>
                <p className="text-gray-600">Ekoloji cəhətdən təmiz materiallar ilə hazırlanmış məhsullar</p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Xüsusi dizayn</h3>
                <p className="text-gray-600">Sizin üçün fərdi dizayn həlləri və yaradıcı yanaşma</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What are Digital Business Cards Section */}
      <DigitalBusinessCardsSection />

      {/* Business Process Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Necə işləyir?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              3 sadə addımda digital biznes həllinizə sahib olun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Məhsul seçin</h3>
              <div className="bg-gray-50 p-4 rounded mb-4 h-32 flex items-center justify-center">
                <div className="bg-gray-200 w-20 h-12 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Product Image</span>
                </div>
              </div>
              <p className="text-gray-600 text-center text-sm">
                Choose your preferred Tapt product based on the level of customisation you desire.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Profil yaradın</h3>
              <div className="bg-gray-50 p-4 rounded mb-4 h-32 flex items-center justify-center">
                <div className="bg-gray-200 w-16 h-20 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">Profile</span>
                </div>
              </div>
              <p className="text-gray-600 text-center text-sm">
                Let your connections know more about your and your company by editing your profile information and design.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Paylaşın</h3>
              <div className="bg-gray-50 p-4 rounded mb-4 h-32 flex items-center justify-center">
                <div className="bg-gray-200 w-12 h-16 rounded flex items-center justify-center mr-2">
                  <span className="text-xs text-gray-500">Phone</span>
                </div>
                <div className="text-gray-400">📡</div>
                <div className="bg-gray-200 w-12 h-8 rounded flex items-center justify-center ml-2">
                  <span className="text-xs text-gray-500">Card</span>
                </div>
              </div>
              <p className="text-gray-600 text-center text-sm">
                With one tap on a smart phone, your connection has access to all the information you want to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Model Section */}
      <SpecialModelSection />

      {/* Business Testimonials */}
      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Müştəri rəyləri
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Biznes həllərinizdən istifadə edən şirkətlərin təcrübələri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <p className="text-gray-600 leading-relaxed mb-6">
                "Veezet ilə biznes əlaqələrimiz əhəmiyyətli dərəcədə artdı. 
                Müştərilərimiz texnologiyamızdan çox təsirlənirlər."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                  AH
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Anar Həsənli</h4>
                  <p className="text-gray-600">CEO, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <p className="text-gray-600 leading-relaxed mb-6">
                "NFC texnologiyası bizim restoranımızda əhəmiyyətli dəyişikliklər yaratdı. 
                Müştərilər menyumuza rahat şəkildə baxa bilirlər."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                  LM
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Leyla Məmmədova</h4>
                  <p className="text-gray-600">Restoran sahibi</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <p className="text-gray-600 leading-relaxed mb-6">
                "Biznes şəbəkəmizi genişləndirmək üçün mükəmməl həll. 
                Kontakt mübadiləsi heç vaxt bu qədər asan olmamışdı."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                  RS
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Rəşad Səlimov</h4>
                  <p className="text-gray-600">Biznes konsultant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductsSection products={products} />

      {/* FAQ Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tez-tez soruşulan suallar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              NFC texnologiyası haqqında ən çox maraq doğuran məsələlər
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 list-none">
                  <h3 className="text-lg font-semibold text-gray-900">NFC texnologiyası nədir və necə işləyir?</h3>
                  <div className="w-6 h-6 text-gray-400 group-open:rotate-45 transition-transform duration-200 flex items-center justify-center relative">
                    <div className="w-4 h-0.5 bg-current absolute"></div>
                    <div className="w-0.5 h-4 bg-current absolute group-open:opacity-0 transition-opacity duration-200"></div>
                  </div>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100">
                  NFC (Near Field Communication) qısa məsafəli simsiz rabitə texnologiyasıdır. 
                  Cihazları 4 sm məsafədə yaxınlaşdırdıqda məlumat mübadiləsi baş verir.
                </div>
              </details>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 list-none">
                  <h3 className="text-lg font-semibold text-gray-900">Bütün telefonlarda işləyir?</h3>
                  <div className="w-6 h-6 text-gray-400 group-open:rotate-45 transition-transform duration-200 flex items-center justify-center relative">
                    <div className="w-4 h-0.5 bg-current absolute"></div>
                    <div className="w-0.5 h-4 bg-current absolute group-open:opacity-0 transition-opacity duration-200"></div>
                  </div>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100">
                  Həm Android həm də iPhone cihazlarında işləyir. Heç bir tətbiq endirmə ehtiyacı yoxdur.
                </div>
              </details>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 list-none">
                  <h3 className="text-lg font-semibold text-gray-900">Məlumatları dəyişə bilərəm?</h3>
                  <div className="w-6 h-6 text-gray-400 group-open:rotate-45 transition-transform duration-200 flex items-center justify-center relative">
                    <div className="w-4 h-0.5 bg-current absolute"></div>
                    <div className="w-0.5 h-4 bg-current absolute group-open:opacity-0 transition-opacity duration-200"></div>
                  </div>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100">
                  Rəqəmsal profilinizi istədiyiniz zaman real vaxtda yeniləyə bilərsiniz.
                </div>
              </details>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 list-none">
                  <h3 className="text-lg font-semibold text-gray-900">Təhlükəsizlik necədir?</h3>
                  <div className="w-6 h-6 text-gray-400 group-open:rotate-45 transition-transform duration-200 flex items-center justify-center relative">
                    <div className="w-4 h-0.5 bg-current absolute"></div>
                    <div className="w-0.5 h-4 bg-current absolute group-open:opacity-0 transition-opacity duration-200"></div>
                  </div>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100">
                  Bütün məlumatlar şifrələnmiş şəkildə saxlanılır və yalnız sizin idarənizdədir.
                </div>
              </details>
            </div>
          </div>

         
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
              Hazırsınız başlamağa?
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              NFC texnologiyası ilə biznesinizi gələcəyə hazırlayın. 
              Bir toxunuşla əlaqə qurmaq artıq həqiqətdir.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/marketplace" 
                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors duration-200 rounded-lg"
              >
                Məhsullara baxın
              </a>
              
              <a 
                href="#contact" 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-200 rounded-lg"
              >
                Əlaqə saxlayın
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Veezet</h3>
              <p className="text-gray-400">
                NFC texnologiyası ilə gələcəyin biznes əlaqə həlləri
              </p>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">📧 info@veezet.az</p>
                <p className="text-gray-400 text-sm">📞 +994 XX XXX XX XX</p>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Məhsullar</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Biznes kartları</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NFC etiketlər</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Xüsusi məhsullar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Menu stand</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Dəstək</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Çatdırılma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Qaytarma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Əlaqə</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Hüquqi</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Şərtlər</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Məxfilik</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Çərəzlər</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lisenziya</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Veezet. Bütün hüquqlar qorunur.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
