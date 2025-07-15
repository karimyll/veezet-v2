'use client'

import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  avatar?: boolean
  width?: string
  height?: string
}

export default function LoadingSkeleton({ 
  className = "",
  lines = 3,
  avatar = false,
  width = 'w-full',
  height = 'h-4'
}: LoadingSkeletonProps) {
  const shimmerVariants = {
    start: {
      backgroundPosition: '-200px 0'
    },
    end: {
      backgroundPosition: '200px 0'
    }
  }

  return (
    <div className={`${className} space-y-4`}>
      {avatar && (
        <div className="flex items-center space-x-4">
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%]"
            animate="end"
            initial="start"
            variants={shimmerVariants}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] rounded-lg w-3/4"
              animate="end"
              initial="start"
              variants={shimmerVariants}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 0.1
              }}
            />
            <motion.div
              className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] rounded-lg w-1/2"
              animate="end"
              initial="start"
              variants={shimmerVariants}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 0.2
              }}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] rounded-lg ${
              index === 0 ? width : 
              index === lines - 1 ? 'w-3/4' : 'w-5/6'
            }`}
            animate="end"
            initial="start"
            variants={shimmerVariants}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    </div>
  )
}
