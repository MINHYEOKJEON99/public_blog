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
          return 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
        case 'modern':
          return 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-md'
        default:
          return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
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
            'flex w-full transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400',
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
        
      </motion.div>
    )
  }
)
Input.displayName = 'Input'

export { Input }