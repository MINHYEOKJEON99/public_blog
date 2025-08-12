'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
        destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline: 'text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
      },
      size: {
        default: 'h-5',
        sm: 'h-4 px-2 text-xs',
        lg: 'h-6 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface BadgeProps extends Omit<HTMLMotionProps<'div'>, 'size' | 'children'>, VariantProps<typeof badgeVariants> {
  animated?: boolean
  pulse?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, animated = false, pulse = false, icon, children, ...props }, ref) => {
    const badgeAnimation = {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
    }

    const pulseAnimation = {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...(animated ? badgeAnimation : {})}
        {...(pulse ? { animate: pulseAnimation } : {})}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        {...props}
      >
        {icon && (
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: pulse ? [0, 360] : 0 }}
            transition={{ duration: pulse ? 2 : 0, repeat: pulse ? Infinity : 0 }}
            className="flex-shrink-0"
          >
            {icon}
          </motion.span>
        )}
        {children}
      </motion.div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }