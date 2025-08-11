'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
  animated?: boolean
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  default: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20'
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500'
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = 'default', animated = false, status, ...props }, ref) => {
  const avatarAnimation = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }

  return (
    <div className="relative">
      <motion.div
        {...(animated ? avatarAnimation : {})}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <AvatarPrimitive.Root
          ref={ref}
          className={cn(
            'relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 dark:ring-gray-700/30',
            sizeClasses[size],
            className
          )}
          {...props}
        />
      </motion.div>
      
      {status && (
        <motion.div
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
            statusColors[status],
            size === 'xs' && 'h-2 w-2',
            size === 'sm' && 'h-2.5 w-2.5',
            (size === 'lg' || size === 'xl' || size === '2xl') && 'h-4 w-4'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        />
      )}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }