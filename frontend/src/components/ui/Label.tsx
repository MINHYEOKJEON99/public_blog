'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-gray-700 dark:text-gray-300',
        modern: 'text-gray-800 dark:text-gray-200 font-semibold',
        glass: 'text-gray-900 dark:text-gray-100 drop-shadow-sm'
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>, VariantProps<typeof labelVariants> {
  animated?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, animated = false, ...props }, ref) => {
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <LabelPrimitive.Root
          ref={ref}
          className={cn(labelVariants({ variant, size }), className)}
          {...props}
        />
      </motion.div>
    )
  }

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({ variant, size }), className)}
      {...props}
    />
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }