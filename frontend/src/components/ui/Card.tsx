'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean
  glassy?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, glassy = false, children, ...props }, ref) => {
    const cardVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" as const }
      },
      hover: hoverable ? {
        y: -8,
        scale: 1.02,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 }
      } : {},
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl border shadow-lg transition-all duration-300',
          glassy 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700' 
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
          hoverable && 'cursor-pointer hover:shadow-xl',
          className
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 dark:text-gray-400 leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Modern animated card variants
const AnimatedCard = React.forwardRef<HTMLDivElement, CardProps & {
  delay?: number
}>(({ delay = 0, ...props }, ref) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }}
    whileHover={{
      y: -12,
      scale: 1.03,
      rotateY: 2,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }}
  >
    <Card ref={ref} {...props} />
  </motion.div>
))
AnimatedCard.displayName = 'AnimatedCard'

const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <Card
      ref={ref}
      glassy
      hoverable
      className={cn(
        'backdrop-blur-md border-gray-200 dark:border-gray-700 shadow-2xl',
        'bg-white/80 dark:bg-gray-900/80',
        className
      )}
      {...props}
    />
  )
)
GlassCard.displayName = 'GlassCard'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, AnimatedCard, GlassCard }