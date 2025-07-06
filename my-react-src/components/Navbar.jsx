import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold text-gray-900">
            Veezet
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Products</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">How to work</a>
            <button className="ml-4 px-4 py-2" style={{ backgroundColor: '#4C257B' }} className="ml-4 px-4 py-2 text-white rounded-full hover:opacity-90 transition">Get Product</button>
            <div className="ml-4">
              {/* User Icon (simple SVG) */}
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
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
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Products</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">How to work</a>
            <button className="w-full mt-2 px-4 py-2" style={{ backgroundColor: '#4C257B' }} className="w-full mt-2 px-4 py-2 text-white rounded-full hover:opacity-90 transition">Get Product</button>
            <div className="mt-2 flex justify-start">
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar