'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
        gradient: 'border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
        glass: 'glass border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-700/30',
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