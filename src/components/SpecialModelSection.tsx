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
              <span style={{
                background: 'linear-gradient(to right, #ec4899, #512784, #ef4444, #eab308)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
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
                {/* Fərdi dizayn icon */}
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5zm0 0v-5m0-5V4m0 6l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Fərdi dizayn</h3>
              <p className="text-gray-600 text-sm">Sizin tələblərinizə uyğun unikal model</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                {/* NFC icon resembling the provided image (antenna with waves) */}
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 19v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M5.64 5.64l1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.66 17.66l-1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M19 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M5.64 18.36l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.66 6.34l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">NFC inteqrasiya</h3>
              <p className="text-gray-600 text-sm">Hər hansı formaya NFC texnologiyası əlavə edilir</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                {/* Yüksək keyfiyyət icon */}
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Yüksək keyfiyyət</h3>
              <p className="text-gray-600 text-sm">Professional materiallar və texnologiya</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                {/* Sürətli hazırlıq icon */}
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sürətli hazırlıq</h3>
              <p className="text-gray-600 text-sm">Qısa müddətdə sifarişinizi hazırlayırıq</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="#contact" 
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 group"
             >
              Əlaqə saxla
            </a>
            
            <a 
              href="#examples" 
              className="inline-flex items-center px-8 py-4 bg-gray-900 border-2 border-gray-900 text-white font-medium rounded-full hover:bg-transparent hover:text-gray-900 transition-all duration-300 group"
             >
              Nümunələrə bax
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
