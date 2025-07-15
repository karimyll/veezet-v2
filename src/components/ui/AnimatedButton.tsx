'use client'

import { motion } from 'framer-motion'
import { Button } from '@heroui/react'
import { ReactNode } from 'react'

interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  startContent?: ReactNode
  endContent?: ReactNode
  onClick?: () => void
  href?: string
  as?: any
  disabled?: boolean
  shimmer?: boolean
  pulse?: boolean
}

export default function AnimatedButton({ 
  children, 
  className = "",
  variant = 'solid',
  color = 'primary',
  size = 'md',
  radius = 'lg',
  startContent,
  endContent,
  onClick,
  href,
  as,
  disabled = false,
  shimmer = false,
  pulse = false
}: AnimatedButtonProps) {
  const baseClass = `${className} relative overflow-hidden group transition-all duration-300 ${
    shimmer ? 'hover:shadow-lg' : ''
  }`

  const AnimatedButtonComponent = (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={pulse ? 'animate-pulse' : ''}
    >
      <Button
        className={baseClass}
        variant={variant}
        color={color}
        size={size}
        radius={radius}
        startContent={startContent}
        endContent={endContent}
        onPress={onClick}
        href={href}
        as={as}
        disabled={disabled}
      >
        <span className="relative z-10">{children}</span>
        {shimmer && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        )}
      </Button>
    </motion.div>
  )

  return AnimatedButtonComponent
}
