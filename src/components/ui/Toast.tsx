'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
}

const toastStyles = {
  success: 'bg-status-success/10 border-status-success/20 text-status-success',
  error: 'bg-status-error/10 border-status-error/20 text-status-error',
  warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
}

export function Toast({ message, type, isVisible, onClose, duration = 4000 }: ToastProps) {
  const Icon = toastIcons[type]

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
        toastStyles[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Hook para usar toasts
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    isVisible: boolean
  } | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => (prev ? { ...prev, isVisible: false } : null))
  }

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
  }
}
