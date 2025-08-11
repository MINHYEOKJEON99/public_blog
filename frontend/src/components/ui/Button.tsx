'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover-glow',
        destructive:
          'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:from-red-600 hover:to-pink-700 hover:shadow-xl',
        outline:
          'border-2 border-blue-200 dark:border-blue-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 shadow-md',
        secondary:
          'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-md',
        ghost: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400',
        link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300',
        glass: 'glass text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-black/30',
        gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl animate-glow',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button

    const buttonAnimation = {
      whileHover: { 
        scale: 1.02,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      },
      whileTap: { 
        scale: 0.98,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      },
    }

    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))}>
          {children}
        </Slot>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...buttonAnimation}
        {...props}
      >
        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }