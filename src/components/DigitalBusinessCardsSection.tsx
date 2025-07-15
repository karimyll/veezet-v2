'use client'

import Image from 'next/image'

export default function DigitalBusinessCardsSection() {
  return (
    <section id="features" className="py-32 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Content - 4 columns (shorter) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Yeni nəsil <span className="text-purple-600">smart</span><br />vizitkartlar<br />nədir?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                100lərlə kağız vizitkartlar əvəzinə bir ədəd NFC dəstəkli smart plastik vizitkart
              </p>
            </div>
            
            <div className="pt-8">
              <a 
                href="#products" 
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 group"
              >
                <span>Xüsusiyyətlərə bax</span>
                <svg className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Content - 8 columns (longer) - Masonry Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Digital Profile Card - Tall */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-[4/5] relative bg-gray-50 p-8">
                    <Image 
                      src="/img/phonewithveezet.png" 
                      alt="Digital profil" 
                      width={300}
                      height={375}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Digital profil</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Bütün şəxsi və şirkət məlumatlarınız bir yerdə, həmişə yenilənə bilər və əldə edilə bilər.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Instant Sharing Card */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-[4/3] relative bg-gray-50 p-6">
                    <Image 
                      src="/img/phonewithveezet.png" 
                      alt="Ani paylaşım" 
                      width={300}
                      height={225}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">Ani paylaşım</h3>
                    <p className="text-gray-600">Kontakt məlumatlarınızı bir toxunuşla paylaşın.</p>
                  </div>
                </div>

                {/* Device Support Card */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-8 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Cihaz dəstəyi</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Həm Android həm də iOS sistemlərində heç bir tətbiq olmadan çalışır.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">Android</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">iOS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

