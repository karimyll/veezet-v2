'use client'

import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, type Variants } from 'framer-motion'
import { useRef, useEffect, useState, type ReactNode } from 'react'

// ========================
// Easing Curves (jitter.video inspired)
// ========================

export const ease = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  spring: { type: 'spring' as const, stiffness: 100, damping: 20 },
  bounce: { type: 'spring' as const, stiffness: 300, damping: 15 },
  gentle: { type: 'spring' as const, stiffness: 50, damping: 25, mass: 1.2 },
}

// ========================
// Animation Variants
// ========================

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ========================
// Components
// ========================

const builtInVariants: Record<string, Variants> = {
  fadeUp,
  fadeDown,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  clipReveal,
  blurIn,
}

interface RevealProps {
  children: ReactNode
  className?: string
  variant?: keyof typeof builtInVariants
  variants?: Variants
  delay?: number
  once?: boolean
  threshold?: number
}

/**
 * Viewport-triggered reveal animation
 */
export function Reveal({
  children,
  className,
  variant,
  variants,
  delay = 0,
  once = true,
  threshold = 0.2,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: threshold })
  const resolvedVariants = variants ?? (variant ? builtInVariants[variant] : fadeUp)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={resolvedVariants}
      className={className}
      style={{ willChange: 'transform, opacity' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerRevealProps {
  children: ReactNode
  className?: string
  stagger?: Variants
  childVariants?: Variants
  once?: boolean
  threshold?: number
}

/**
 * Staggered children reveal animation
 */
export function StaggerReveal({
  children,
  className,
  stagger = staggerContainer,
  childVariants = fadeUp,
  once = true,
  threshold = 0.15,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: threshold })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual stagger child item
 */
export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: ReactNode
  className?: string
  variants?: Variants
}) {
  return (
    <motion.div variants={variants} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
  offset?: [string, string]
}

/**
 * Parallax scroll effect
 */
export function Parallax({ children, className, speed = 0.3, offset = ['start end', 'end start'] }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: offset as any })
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

interface TextRevealProps {
  text: string
  className?: string
  once?: boolean
  delay?: number
}

/**
 * Word-by-word text reveal animation
 */
export function TextReveal({ text, className, once = true, delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: 0.3 })
  const words = text.split(' ')

  return (
    <motion.span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

/**
 * Magnetic hover effect — element subtly follows cursor
 */
export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0px, 0px)'
    }
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingProps {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
}

/**
 * Subtle floating animation
 */
export function Floating({ children, className, duration = 4, distance = 10 }: FloatingProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-distance, distance, -distance] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Gradient animated background
 */
export function GradientBlob({
  className = '',
  size = 256,
  colors = ['#2D1B4E', '#4C257B', '#6B46C1'],
}: {
  className?: string
  size?: number
  colors?: string[]
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
        borderRadius: ['50%', '40%', '50%'],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${colors.join(', ')})`,
      }}
    />
  )
}

/**
 * Counter animation — animates a number from 0 to target
 */
export function AnimatedCounter({
  to,
  suffix = '',
  prefix = '',
  className,
  duration = 2,
  delay = 0,
}: {
  to: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const timeout = setTimeout(() => {
      let start = 0
      const end = to
      const stepTime = (duration * 1000) / end
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start >= end) clearInterval(timer)
      }, stepTime)
      return () => clearInterval(timer)
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [isInView, to, duration, delay])

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  )
}
