'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  variant?: 'default' | 'glass' | 'dark' | 'light'
  size?: 'sm' | 'default' | 'lg'
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, variant = 'default', size = 'default', ...props }, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'glass bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 border-white/20 dark:border-gray-700/30'
      case 'dark':
        return 'bg-gray-900 text-gray-100 border-gray-700'
      case 'light':
        return 'bg-white text-gray-900 border-gray-200 shadow-md'
      default:
        return 'bg-primary text-primary-foreground'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-4 py-2 text-base'
      default:
        return 'px-3 py-1.5 text-sm'
    }
  }

  return (
    <AnimatePresence>
      <TooltipPrimitive.Portal forceMount>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            'z-50 overflow-hidden rounded-lg border shadow-md',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            getVariantClasses(),
            getSizeClasses(),
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Portal>
    </AnimatePresence>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Quick Tooltip component for common use cases
interface QuickTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  variant?: 'default' | 'glass' | 'dark' | 'light'
  size?: 'sm' | 'default' | 'lg'
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
}

const QuickTooltip: React.FC<QuickTooltipProps> = ({
  children,
  content,
  variant = 'glass',
  size = 'default',
  side = 'top',
  delayDuration = 100
}) => (
  <TooltipProvider>
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent variant={variant} size={size} side={side}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {content}
        </motion.div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, QuickTooltip }