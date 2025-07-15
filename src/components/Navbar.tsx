'use client'

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, User, Link as HeroLink } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="top-0 left-0 right-0 z-50 sticky"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link href="/" className="flex-shrink-0 text-2xl font-bold text-gray-900 hover:text-[#2D1B4E] transition-all duration-300 flex items-center gap-3 group">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-[#2D1B4E] to-[#4C257B] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl"
                whileHover={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: 1.1,
                  boxShadow: "0 15px 35px -5px rgba(45, 27, 78, 0.5)"
                }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-white font-bold text-lg">V</span>
              </motion.div>
              <span className="hidden sm:block group-hover:text-[#2D1B4E] transition-colors duration-300">Veezet</span>
            </Link>
          </motion.div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <HeroLink
                href="#products"
                className="text-gray-700 hover:text-white font-medium transition-all duration-300 px-5 py-2.5 rounded-full hover:bg-gray-800 relative overflow-hidden group"
                color="foreground"
              >
                <span className="relative z-10">Məhsullar</span>
                <motion.div
                  className="absolute inset-0 bg-gray-800 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </HeroLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <HeroLink
                href="#features"
                className="text-gray-700 hover:text-white font-medium transition-all duration-300 px-5 py-2.5 rounded-full hover:bg-gray-800 relative overflow-hidden group"
                color="foreground"
              >
                <span className="relative z-10">Xüsusiyyətlər</span>
                <motion.div
                  className="absolute inset-0 bg-gray-800 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </HeroLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <HeroLink
                href="#pricing"
                className="text-gray-700 hover:text-white font-medium transition-all duration-300 px-5 py-2.5 rounded-full hover:bg-gray-800 relative overflow-hidden group"
                color="foreground"
              >
                <span className="relative z-10">Qiymət</span>
                <motion.div
                  className="absolute inset-0 bg-gray-800 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </HeroLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <HeroLink
                href="#faq"
                className="text-gray-700 hover:text-white font-medium transition-all duration-300 px-5 py-2.5 rounded-full hover:bg-gray-800 relative overflow-hidden group"
                color="foreground"
              >
                <span className="relative z-10">FAQ</span>
                <motion.div
                  className="absolute inset-0 bg-gray-800 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </HeroLink>
            </motion.div>
            
            {session ? (
              <div className="flex items-center space-x-3 ml-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    as={Link}
                    href="/dashboard"
                    className="bg-gradient-to-r from-[#2D1B4E] to-[#4C257B] text-white font-bold shadow-lg hover:shadow-xl hover:from-[#1A0F2E] hover:to-[#2D1B4E] transition-all duration-300 relative overflow-hidden group"
                    radius="full"
                    size="md"
                    variant="solid"
                    color="primary"
                  >
                    <span className="relative z-10">İdarə Paneli</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Avatar
                        isBordered
                        as="button"
                        className="transition-all duration-300 hover:shadow-lg hover:shadow-[#4C257B]/25"
                        color="primary"
                        name={session.user?.name || "User"}
                        size="sm"
                        src={session.user?.image || undefined}
                      />
                    </motion.div>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                      <User
                        name={session.user?.name || "User"}
                        description={session.user?.email}
                        avatarProps={{
                          src: session.user?.image || undefined,
                          size: "sm"
                        }}
                      />
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      startContent={<span className="text-lg">⚙️</span>}
                    >
                      Tənzimləmələr
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      onPress={() => signOut()}
                      startContent={<span className="text-lg">🚪</span>}
                    >
                      Çıxış
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    href="#products"
                    className="bg-gradient-to-r from-[#2D1B4E] to-[#4C257B] text-white font-bold shadow-lg hover:shadow-xl hover:from-[#1A0F2E] hover:to-[#2D1B4E] transition-all duration-300 relative overflow-hidden group"
                    radius="full"
                    size="md"
                    variant="solid"
                    color="primary"
                  >
                    <span className="relative z-10">Məhsul Al</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    as={Link}
                    href="/auth/signin"
                    className="text-gray-800 hover:text-[#2D1B4E] font-semibold border-gray-400 hover:border-[#2D1B4E] hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                    radius="full"
                    size="md"
                    variant="bordered"
                    color="default"
                  >
                    <span className="relative z-10">Giriş</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#2D1B4E]/15 to-[#4C257B]/15"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button
                isIconOnly
                variant="light"
                onPress={() => setMenuOpen(!menuOpen)}
                className="text-gray-800 hover:text-[#2D1B4E] hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md transition-all duration-300 rounded-2xl"
                size="sm"
              >
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                  animate={menuOpen ? "open" : "closed"}
                >
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    variants={{
                      closed: { d: "M4 8h16M4 16h16" },
                      open: { d: "M6 18L18 6M6 6l12 12" }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.svg>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/98 backdrop-blur-xl shadow-xl border-t border-gray-200 overflow-hidden"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="container mx-auto px-4 pt-6 pb-6 space-y-4"
            >
              {[
                { href: "#products", text: "Məhsullar", delay: 0.1 },
                { href: "#features", text: "Xüsusiyyətlər", delay: 0.15},
                { href: "#pricing", text: "Qiymət", delay: 0.2 },
                { href: "#faq", text: "FAQ", delay: 0.25 }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: item.delay }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HeroLink
                    href={item.href}
                    as={item.href.startsWith('/') ? Link : undefined}
                    className="block font-medium py-3 px-5 rounded-full transition-all duration-300 text-lg relative overflow-hidden group text-gray-700 hover:text-white hover:bg-gray-800"
                    color="foreground"
                  >
                    <div className="flex items-center gap-4">
                      <motion.span 
                        className="w-3 h-3 rounded-full opacity-80 bg-gradient-to-r from-gray-400 to-gray-600"
                        whileHover={{ scale: 1.3, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="relative z-10">{item.text}</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-gray-800 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </HeroLink>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="pt-6 border-t border-gray-200 space-y-4"
              >
                {session ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.35 }}
                      className="flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                    >
                      <Avatar
                        isBordered
                        color="primary"
                        name={session.user?.name || "User"}
                        size="md"
                        src={session.user?.image || undefined}
                      />
                      <div className="flex flex-col">
                        <p className="text-base font-semibold text-gray-900">
                          {session.user?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        as={Link}
                        href="/dashboard"
                        className="w-full justify-start bg-gradient-to-r from-[#2D1B4E] to-[#4C257B] text-white font-bold shadow-lg text-base hover:from-[#1A0F2E] hover:to-[#2D1B4E] transition-all duration-300 relative overflow-hidden group"
                        radius="full"
                        size="lg"
                        variant="solid"
                        startContent={<span className="text-xl">📊</span>}
                      >
                        <span className="relative z-10">İdarə Paneli</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.45 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full justify-start text-gray-800 hover:text-red-700 font-semibold text-base hover:bg-red-50 hover:shadow-md transition-all duration-300 rounded-2xl"
                        onPress={() => signOut()}
                        radius="full"
                        size="lg"
                        variant="light"
                        startContent={<span className="text-xl">🚪</span>}
                      >
                        Çıxış
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.35 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        href="#products"
                        className="w-full justify-start bg-gradient-to-r from-[#2D1B4E] to-[#4C257B] text-white font-bold shadow-lg text-base hover:from-[#1A0F2E] hover:to-[#2D1B4E] transition-all duration-300 relative overflow-hidden group"
                        radius="full"
                        size="lg"
                        variant="solid"
                        startContent={<span className="text-xl">🛍️</span>}
                      >
                        <span className="relative z-10">Məhsul Al</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        as={Link}
                        href="/auth/signin"
                        className="w-full justify-start text-gray-800 hover:text-[#2D1B4E] font-semibold border-gray-400 hover:border-[#2D1B4E] text-base hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                        radius="full"
                        size="lg"
                        variant="bordered"
                        startContent={<span className="text-xl">🔐</span>}
                      >
                        <span className="relative z-10">Giriş</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#2D1B4E]/15 to-[#4C257B]/15"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
