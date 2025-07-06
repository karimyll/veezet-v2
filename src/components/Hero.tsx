'use client'

import Image from "next/image"

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-background bg-white rounded-bl-[100px] rounded-br-[100px] md:rounded-bl-[200px] md:rounded-br-[200px]">
        <div className="texts flex flex-col container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold py-5 md:py-20 flex justify-center text-[#512784] text-center">
            Tək Toxunuşla Əlaqə!
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-between w-full px-0 md:px-4 gap-8 md:gap-0">
            {/* Sol element */}
            <div className="flex-1 text-center md:text-left pb-8 md:pb-20 sm:pb-0 order-1 md:order-none">
              <p className="font-medium text-base sm:text-lg md:text-xl">
                NFC texnologiyası ilə hazırlanmış innovativ məhsullar
              </p>
            </div>
            {/* Orta şəkil */}
            <div className="w-full md:w-2xl flex-shrink-0 mx-auto mt-4 md:mt-10 order-3 md:order-none">
              <Image 
                src="/img/hero-iphone.png" 
                alt="Phone" 
                width={400} 
                height={600}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            {/* Sağ element */}
            <div className="flex-1 text-center md:text-right pb-8 md:pb-20 order-2 md:order-none">
              <h5 className="font-medium text-3xl sm:text-4xl md:text-5xl">
                80+ müştəri
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
