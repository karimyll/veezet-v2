'use client'

export default function SpecialModelSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center space-y-16">
          {/* Header */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-700 text-sm font-medium">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              3D Print Texnologiyası
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Xüsusi NFC{' '}
              <span className="text-gray-600">
                məhsul
              </span>
              <br />
              istəyin var?
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Narahat olma! 3D print texnologiyası ilə istənilən modelinizi çap edib, NFC inteqrasiya edə bilərik!
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Fərdi dizayn</h3>
              <p className="text-gray-600 text-sm">Sizin tələblərinizə uyğun unikal model</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">NFC inteqrasiya</h3>
              <p className="text-gray-600 text-sm">Hər hansı formaya NFC texnologiyası əlavə edilir</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Yüksək keyfiyyət</h3>
              <p className="text-gray-600 text-sm">Professional materiallar və texnologiya</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sürətli hazırlıq</h3>
              <p className="text-gray-600 text-sm">Qısa müddətdə sifarişinizi hazırlayırıq</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="#contact" 
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              Əlaqə saxla
            </a>
            
            <a 
              href="#examples" 
              className="inline-flex items-center px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              Nümunələrə bax
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
