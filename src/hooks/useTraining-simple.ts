'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  createWorkoutSession,
  getActiveWorkoutSession
} from '@/lib/api/training-simple'
import type {
  WorkoutSession,
  ActiveWorkoutSession,
  WorkoutFormData
} from '@/types/training'
import { WORKOUT_STATUS } from '@/types/training'

// =====================================================
// HOOK ROBUSTO DE TRAINING - SIN CICLOS INFINITOS
// =====================================================

export function useTraining() {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  
  // Refs para evitar re-renders
  const loadingRef = useRef(false)
  const userIdRef = useRef<string | null>(null)

  // Cargar sesión activa SOLO una vez por usuario
  useEffect(() => {
    // Evitar cargas duplicadas
    if (loadingRef.current) return
    
    // Si no hay usuario, limpiar estado
    if (!user?.id) {
      setActiveSession(null)
      setLoading(false)
      setInitialized(true)
      userIdRef.current = null
      return
    }

    // Si es el mismo usuario, no recargar
    if (userIdRef.current === user.id && initialized) {
      return
    }

    const loadActiveSession = async () => {
      loadingRef.current = true
      
      try {
        setLoading(true)
        setError(null)
        
        const session = await getActiveWorkoutSession(user.id)
        
        if (session) {
          const activeSession: ActiveWorkoutSession = {
            ...session,
            current_set_number: 1,
            is_resting: false,
            rest_timer_seconds: 0,
            rest_timer_preset: 90
          }
          setActiveSession(activeSession)
        } else {
          setActiveSession(null)
        }
        
      } catch (err) {
        console.error('Error loading active session:', err)
        setError(err instanceof Error ? err.message : 'Error loading session')
        setActiveSession(null)
      } finally {
        setLoading(false)
        setInitialized(true)
        loadingRef.current = false
        userIdRef.current = user.id
      }
    }

    loadActiveSession()
  }, [user?.id]) // Solo depende del ID del usuario

  // Crear nueva sesión CON RUTINA REQUERIDA
  const startWorkout = useCallback(async (routineId: string, data: WorkoutFormData = {}) => {
    if (!user) throw new Error('User not authenticated')
    if (!routineId) throw new Error('Routine is required to start workout')

    try {
      setLoading(true)
      setError(null)
      
      const session = await createWorkoutSession(user.id, {
        ...data,
        routine_id: routineId
      })
      
      const activeSession: ActiveWorkoutSession = {
        ...session,
        current_set_number: 1,
        is_resting: false,
        rest_timer_seconds: 0,
        rest_timer_preset: 90
      }
      
      setActiveSession(activeSession)
      return activeSession
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error starting workout'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Completar entrenamiento
  const completeWorkout = useCallback(async (totalDurationSeconds: number = 0) => {
    if (!activeSession || !user) return

    try {
      setLoading(true)
      
      // TODO: Implementar API call completa cuando esté lista
      // await completeWorkoutSession(activeSession.id, totalDurationSeconds)
      
      setActiveSession(null)
      setError(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completing workout')
    } finally {
      setLoading(false)
    }
  }, [activeSession, user])

  // Pausar entrenamiento
  const pauseWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      setActiveSession(prev => prev ? { ...prev, status: WORKOUT_STATUS.PAUSED } : null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error pausing workout')
    }
  }, [activeSession])

  // Reanudar entrenamiento
  const resumeWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      setActiveSession(prev => prev ? { ...prev, status: WORKOUT_STATUS.ACTIVE } : null)
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
      
      // TODO: Implementar API call completa cuando esté lista
      // await cancelWorkoutSession(activeSession.id)
      
      setActiveSession(null)
      setError(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error canceling workout')
    } finally {
      setLoading(false)
    }
  }, [activeSession])

  return {
    // Estado
    activeSession,
    sets: [], // Por ahora vacío
    loading,
    error,
    initialized,
    isActive: !!activeSession && activeSession.status === WORKOUT_STATUS.ACTIVE,
    isPaused: !!activeSession && activeSession.status === WORKOUT_STATUS.PAUSED,
    
    // Acciones
    startWorkout,
    completeWorkout,
    pauseWorkout,
    resumeWorkout,
    cancelWorkout,
    
    // Placeholders para compatibilidad
    addSet: async () => ({ id: '', workout_session_id: '', exercise_id: '', set_number: 1, set_type: 'normal' as const, reps_completed: 0, completed_at: '', created_at: '' }),
    updateSet: async () => ({ id: '', workout_session_id: '', exercise_id: '', set_number: 1, set_type: 'normal' as const, reps_completed: 0, completed_at: '', created_at: '' }),
    removeSet: async () => {},
    
    // Utilidades
    clearError: () => setError(null)
  }
}
