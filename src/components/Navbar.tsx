'use client'

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-2xl font-bold text-gray-900">
            Veezet
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#products" className="text-gray-700 hover:text-blue-600 font-medium">Products</a>
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium">
              Marketplace
            </Link>
            <a href="#how-to-work" className="text-gray-700 hover:text-blue-600 font-medium">How to work</a>
            
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <button className="px-4 py-2 bg-[#4C257B] text-white rounded-full hover:opacity-90 transition">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="#products" className="px-4 py-2 bg-[#4C257B] text-white rounded-full hover:opacity-90 transition">
                  Məhsul Al
                </a>
                <Link href="/auth/signin">
                  <span className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer">
                    Giriş
                  </span>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#products" className="text-gray-700 hover:text-blue-600 font-medium">Products</a>
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium">
              Marketplace
            </Link>
            <a href="#how-to-work" className="text-gray-700 hover:text-blue-600 font-medium">How to work</a>
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-left text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 bg-[#4C257B] text-white rounded-full hover:opacity-90 transition w-full">
                  Get Product
                </button>
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 font-medium">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
