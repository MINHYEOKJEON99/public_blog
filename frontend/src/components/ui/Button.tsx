'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl',
        destructive:
          'bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl',
        outline:
          'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm',
        secondary:
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
        link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300',
        success: 'bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        xl: 'h-12 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size" | "children">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const buttonAnimation = {
      whileHover: { 
        scale: 1.02,
        y: -2,
        transition: { type: "spring" as const, stiffness: 400, damping: 10 }
      },
      whileTap: { 
        scale: 0.98,
        y: 0,
        transition: { type: "spring" as const, stiffness: 400, damping: 10 }
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
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...buttonAnimation}
        {...props}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }