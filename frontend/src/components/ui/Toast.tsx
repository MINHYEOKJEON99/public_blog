'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: 'glass bg-green-50/80 dark:bg-green-900/40 border-green-200/50 dark:border-green-800/50 text-green-800 dark:text-green-300 shadow-lg shadow-green-500/20',
  error: 'glass bg-red-50/80 dark:bg-red-900/40 border-red-200/50 dark:border-red-800/50 text-red-800 dark:text-red-300 shadow-lg shadow-red-500/20',
  warning: 'glass bg-yellow-50/80 dark:bg-yellow-900/40 border-yellow-200/50 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-300 shadow-lg shadow-yellow-500/20',
  info: 'glass bg-blue-50/80 dark:bg-blue-900/40 border-blue-200/50 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 shadow-lg shadow-blue-500/20',
}

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-[100] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 400, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              y: index * 80
            }}
            exit={{ 
              opacity: 0, 
              x: 400, 
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="absolute top-0 right-0"
          >
            <Toast
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastProps {
  toast: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }
  onClose: () => void
}

function Toast({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type]
  
  useEffect(() => {
    // Auto dismiss
    const duration = toast.duration || 5000
    const dismissTimer = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearTimeout(dismissTimer)
    }
  }, [toast.duration, onClose])

  return (
    <motion.div
      className="pointer-events-auto w-full max-w-sm"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={cn(
          'rounded-2xl border-2 p-4 backdrop-blur-xl',
          toastStyles[toast.type]
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 15, 
              delay: 0.2 
            }}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          </motion.div>
          
          <motion.div 
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-semibold text-sm">{toast.title}</p>
            {toast.message && (
              <motion.p 
                className="text-sm opacity-90 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.4 }}
              >
                {toast.message}
              </motion.p>
            )}
          </motion.div>
          
          <motion.button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
        
        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-2xl"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  )
}