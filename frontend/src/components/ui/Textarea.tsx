'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'glass' | 'modern'
  textareaSize?: 'sm' | 'default' | 'lg'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', textareaSize = 'default', ...props }, ref) => {
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
      switch (textareaSize) {
        case 'sm':
          return 'min-h-[80px] px-3 py-2 text-xs rounded-lg'
        case 'lg':
          return 'min-h-[140px] px-4 py-3 text-base rounded-xl'
        default:
          return 'min-h-[100px] px-3 py-2 text-sm rounded-xl'
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
        <textarea
          className={cn(
            'flex w-full resize-none transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500',
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
Textarea.displayName = 'Textarea'

export { Textarea }