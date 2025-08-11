'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'default' | 'lg'
  animated?: boolean
  showValue?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  variant = 'default', 
  size = 'default', 
  animated = true,
  showValue = false,
  ...props 
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-green-600'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-red-600'
      default:
        return 'bg-primary'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1'
      case 'lg':
        return 'h-4'
      default:
        return 'h-2'
    }
  }

  return (
    <div className="w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800',
          getSizeClasses(),
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            'h-full w-full flex-1 transition-all',
            getVariantClasses()
          )}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            initial={{ x: '-200%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </ProgressPrimitive.Root>
      
      {showValue && (
        <motion.div
          className="mt-2 text-right text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {value}%
        </motion.div>
      )}
    </div>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }