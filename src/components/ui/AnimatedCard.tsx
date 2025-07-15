'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hoverScale?: number
  hoverShadow?: boolean
  gradient?: boolean
}

export default function AnimatedCard({ 
  children, 
  className = "", 
  delay = 0,
  hoverScale = 1.03,
  hoverShadow = true,
  gradient = false
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: hoverScale,
        ...(hoverShadow && {
          boxShadow: gradient 
            ? "0 25px 50px -12px rgba(76, 37, 123, 0.25)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        })
      }}
      whileTap={{ scale: 0.98 }}
      className={`${className} ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'} rounded-xl shadow-lg transition-all duration-300`}
    >
      {children}
    </motion.div>
  )
}
