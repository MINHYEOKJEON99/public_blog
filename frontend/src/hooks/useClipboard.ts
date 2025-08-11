import { useState } from 'react'

export interface UseClipboardOptions {
  timeout?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000, onSuccess, onError } = options
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = async (text: string) => {
    if (!navigator.clipboard) {
      const err = new Error('Clipboard API not supported')
      setError(err)
      onError?.(err)
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setError(null)
      onSuccess?.()

      // Reset after timeout
      setTimeout(() => {
        setIsCopied(false)
      }, timeout)

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy to clipboard')
      setError(error)
      onError?.(error)
      return false
    }
  }

  const reset = () => {
    setIsCopied(false)
    setError(null)
  }

  return {
    copy,
    reset,
    isCopied,
    error,
  }
}