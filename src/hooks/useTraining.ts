'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { useLoadingTimeout } from './useLoadingTimeout'
import { useRouter } from 'next/navigation'
import { WorkoutSession } from '@/types/training'
import {
  createWorkoutSession,
  getActiveWorkoutSession,
  completeWorkoutSession,
  cancelWorkoutSession,
} from '@/lib/api/training'
import { WORKOUT_STATUS } from '@/types/training'

// =====================================================
// HOOK ROBUSTO DE TRAINING - SIN CICLOS INFINITOS
// =====================================================

export function useTraining() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Hook de timeout para prevenir loading infinito
  const {
    isLoading: timeoutLoading,
    hasTimedOut,
    error: timeoutError,
    startLoading,
    stopLoading,
    retry: retryTimeout,
  } = useLoadingTimeout({
    timeout: 10000, // 10 segundos para training
    timeoutMessage: 'La carga del entrenamiento está tardando más de lo esperado',
  })

  // Refs para evitar re-renders
  const loadingRef = useRef(false)
  const userIdRef = useRef<string | null>(null)

  // Cargar sesión activa SOLO una vez por usuario
  useEffect(() => {
    let mounted = true

    const loadActiveSession = async () => {
      if (!user) {
        setLoading(false)
        setInitialized(true)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const session = await getActiveWorkoutSession(user.id)

        if (mounted) {
          setActiveSession(session)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading active session'
        console.error('Error loading active session:', err)

        if (mounted) {
          setError(errorMessage)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    loadActiveSession()

    return () => {
      mounted = false
    }
  }, [user?.id]) // SOLO depender del ID del usuario

  // Crear nueva sesión CON RUTINA REQUERIDA
  const startWorkout = useCallback(
    async (routineId: string, data: any = {}) => {
      if (!user) throw new Error('User not authenticated')
      if (!routineId) throw new Error('Routine is required to start workout')

      try {
        setLoading(true)
        setError(null)

        const session = await createWorkoutSession(user.id, {
          ...data,
          routine_id: routineId,
        })

        setActiveSession(session)
        return session
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error starting workout'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  // Completar entrenamiento - IMPLEMENTACIÓN REAL
  const completeWorkout = useCallback(
    async (totalDurationSeconds?: number) => {
      if (!activeSession || !user) return

      try {
        setLoading(true)
        setError(null)

        // Calcular duración si no se proporciona
        const duration =
          totalDurationSeconds ||
          Math.floor((new Date().getTime() - new Date(activeSession.started_at).getTime()) / 1000)

        // Llamada real a la API
        await completeWorkoutSession(activeSession.id, duration)

        // Limpiar estado de forma segura
        setActiveSession(null)

        // Forzar navegación después de limpiar estado
        setTimeout(() => {
          router.push('/training')
        }, 100)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error completing workout'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [activeSession, user, router]
  )
  const pauseWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      setActiveSession(prev => (prev ? { ...prev, status: WORKOUT_STATUS.PAUSED } : null))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error pausing workout')
    }
  }, [activeSession])

  // Reanudar entrenamiento
  const resumeWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      setActiveSession(prev => (prev ? { ...prev, status: WORKOUT_STATUS.ACTIVE } : null))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resuming workout')
    }
  }, [activeSession])

  // Cancelar entrenamiento
  const cancelWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      setLoading(true)
      setError(null)

      // Llamada real a la API para cancelar
      await cancelWorkoutSession(activeSession.id)

      // Limpiar estado de forma segura
      setActiveSession(null)

      // Forzar navegación después de limpiar estado
      setTimeout(() => {
        router.push('/training')
      }, 100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error canceling workout'
      setError(errorMessage)
      console.error('Cancel workout error:', err)
    } finally {
      setLoading(false)
    }
  }, [activeSession, router])

  const retry = () => {
    setInitialized(false)
    setError(null)
    retryTimeout()
  }

  // Utilidades
  const clearError = () => setError(null)

  return {
    // Estado
    activeSession,
    sets: [], // Por ahora vacío
    loading,
    error,
    initialized,

    // Estados derivados
    isActive: activeSession?.status === 'active',
    isPaused: activeSession?.status === 'paused',

    // Acciones
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
    cancelWorkout,

    // Utilidades
    clearError: () => setError(null),
  }
}
