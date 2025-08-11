'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'glass' | 'modern'
  inputSize?: 'sm' | 'default' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', inputSize = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return 'glass border-white/20 dark:border-gray-700/30 bg-white/10 dark:bg-gray-800/20 backdrop-blur-xl'
        case 'modern':
          return 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 shadow-lg'
        default:
          return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
      }
    }

    const getSizeStyles = () => {
      switch (inputSize) {
        case 'sm':
          return 'h-8 px-3 py-1 text-xs rounded-lg'
        case 'lg':
          return 'h-12 px-4 py-3 text-base rounded-xl'
        default:
          return 'h-10 px-3 py-2 text-sm rounded-xl'
      }
    }

    return (
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <input
          type={type}
          className={cn(
            'flex w-full transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
            getSizeStyles(),
            getVariantStyles(),
            isFocused && 'shadow-xl shadow-blue-500/10',
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {/* Animated border effect */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-500/50 pointer-events-none"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform"
            animate={{
              translateX: isFocused ? ['−200%', '200%'] : '−200%',
            }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    )
  }
)
Input.displayName = 'Input'

export { Input }