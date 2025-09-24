'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}

// Hook para acciones que requieren autenticación
export function useAuthAction() {
  const { user } = useAuth()
  const router = useRouter()

  const requireAuth = (action: () => void, redirectTo: string = '/auth/login') => {
    if (!user) {
      router.push(redirectTo)
      return
    }
    action()
  }

  return { requireAuth, isAuthenticated: !!user }
}
