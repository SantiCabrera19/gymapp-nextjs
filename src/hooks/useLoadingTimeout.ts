/**
 * Hook para prevenir skeletons infinitos con timeout y fallback
 * Garantiza que ningún loading state permanezca activo indefinidamente
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseLoadingTimeoutOptions {
  /** Timeout en milisegundos (default: 10000ms = 10s) */
  timeout?: number
  /** Callback cuando se alcanza el timeout */
  onTimeout?: () => void
  /** Mensaje de error por timeout */
  timeoutMessage?: string
}

interface LoadingState {
  isLoading: boolean
  hasTimedOut: boolean
  error: string | null
  startTime: number | null
}

export function useLoadingTimeout(options: UseLoadingTimeoutOptions = {}) {
  const {
    timeout = 10000, // 10 segundos máximo
    onTimeout,
    timeoutMessage = 'La carga está tomando más tiempo del esperado. Por favor, intenta recargar la página.',
  } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    hasTimedOut: false,
    error: null,
    startTime: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startLoading = useCallback(() => {
    if (!mountedRef.current) return

    setState({
      isLoading: true,
      hasTimedOut: false,
      error: null,
      startTime: Date.now(),
    })

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Configurar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasTimedOut: true,
        error: timeoutMessage,
      }))

      onTimeout?.()
    }, timeout)
  }, [timeout, timeoutMessage, onTimeout])

  const stopLoading = useCallback((error?: string) => {
    if (!mountedRef.current) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      error: error || null,
    }))
  }, [])

  const reset = useCallback(() => {
    if (!mountedRef.current) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setState({
      isLoading: false,
      hasTimedOut: false,
      error: null,
      startTime: null,
    })
  }, [])

  const retry = useCallback(() => {
    reset()
    startLoading()
  }, [reset, startLoading])

  return {
    ...state,
    startLoading,
    stopLoading,
    reset,
    retry,
    // Utilidades
    isLoadingTooLong: state.startTime ? Date.now() - state.startTime > timeout * 0.7 : false,
    elapsedTime: state.startTime ? Date.now() - state.startTime : 0,
  }
}
