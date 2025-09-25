'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  createWorkoutSession,
  getActiveWorkoutSession
} from '@/lib/api/training-simple'
import type {
  WorkoutSession,
  ExerciseSet,
  ActiveWorkoutSession,
  WorkoutTimers,
  TimerState,
  SetFormData,
  WorkoutFormData,
  RestTimerPreset,
  SET_TYPES
} from '@/types/training'
import { WORKOUT_STATUS } from '@/types/training'

// =====================================================
// HOOK PRINCIPAL DE TRAINING
// =====================================================

export function useTraining() {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(null)
  const [sets, setSets] = useState<ExerciseSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar sesión activa al montar
  useEffect(() => {
    if (!user) {
      setActiveSession(null)
      setSets([])
      setLoading(false)
      return
    }

    const loadActiveSession = async () => {
      try {
        setLoading(true)
        const session = await getActiveWorkoutSession(user.id)
        
        if (session) {
          // Convertir a ActiveWorkoutSession con valores por defecto
          const activeSession: ActiveWorkoutSession = {
            ...session,
            current_set_number: 1,
            is_resting: false,
            rest_timer_seconds: 0,
            rest_timer_preset: 90
          }
          setActiveSession(activeSession)
          
          // Cargar sets existentes
          const existingSets = await getWorkoutSets(session.id)
          setSets(existingSets)
        }
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading session')
      } finally {
        setLoading(false)
      }
    }

    loadActiveSession()
  }, [user])

  // Crear nueva sesión
  const startWorkout = useCallback(async (data: WorkoutFormData = {}) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const session = await createWorkoutSession(user.id, data)
      
      const activeSession: ActiveWorkoutSession = {
        ...session,
        current_set_number: 1,
        is_resting: false,
        rest_timer_seconds: 0,
        rest_timer_preset: 90
      }
      
      setActiveSession(activeSession)
      setSets([])
      setError(null)
      
      return activeSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting workout')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  // Completar sesión
  const completeWorkout = useCallback(async (totalDurationSeconds: number) => {
    if (!activeSession) throw new Error('No active session')

    try {
      setLoading(true)
      await completeWorkoutSession(activeSession.id, totalDurationSeconds)
      setActiveSession(null)
      setSets([])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completing workout')
      throw err
    } finally {
      setLoading(false)
    }
  }, [activeSession])

  // Pausar/reanudar sesión
  const pauseWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      await pauseWorkoutSession(activeSession.id)
      setActiveSession(prev => prev ? { ...prev, status: WORKOUT_STATUS.PAUSED } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error pausing workout')
    }
  }, [activeSession])

  const resumeWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      await resumeWorkoutSession(activeSession.id)
      setActiveSession(prev => prev ? { ...prev, status: WORKOUT_STATUS.ACTIVE } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resuming workout')
    }
  }, [activeSession])

  // Cancelar sesión
  const cancelWorkout = useCallback(async () => {
    if (!activeSession) return

    try {
      setLoading(true)
      await cancelWorkoutSession(activeSession.id)
      setActiveSession(null)
      setSets([])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelling workout')
    } finally {
      setLoading(false)
    }
  }, [activeSession])

  // Agregar set
  const addSet = useCallback(async (exerciseId: string, setData: SetFormData) => {
    if (!activeSession) throw new Error('No active session')

    try {
      const newSet = await addExerciseSet(activeSession.id, exerciseId, setData)
      setSets(prev => [...prev, newSet])
      
      // Actualizar número de serie actual
      setActiveSession(prev => prev ? {
        ...prev,
        current_exercise_id: exerciseId,
        current_set_number: prev.current_set_number + 1
      } : null)
      
      return newSet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding set')
      throw err
    }
  }, [activeSession])

  // Actualizar set
  const updateSet = useCallback(async (setId: string, updates: Partial<SetFormData>) => {
    try {
      const updatedSet = await updateExerciseSet(setId, updates)
      setSets(prev => prev.map(set => set.id === setId ? updatedSet : set))
      return updatedSet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating set')
      throw err
    }
  }, [])

  // Eliminar set
  const removeSet = useCallback(async (setId: string) => {
    try {
      await deleteExerciseSet(setId)
      setSets(prev => prev.filter(set => set.id !== setId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing set')
      throw err
    }
  }, [])

  return {
    // Estado
    activeSession,
    sets,
    loading,
    error,
    isActive: !!activeSession && activeSession.status === WORKOUT_STATUS.ACTIVE,
    isPaused: !!activeSession && activeSession.status === WORKOUT_STATUS.PAUSED,
    
    // Acciones
    startWorkout,
    completeWorkout,
    pauseWorkout,
    resumeWorkout,
    cancelWorkout,
    addSet,
    updateSet,
    removeSet,
    
    // Utilidades
    clearError: () => setError(null)
  }
}

// =====================================================
// HOOK PARA TIMERS
// =====================================================

export function useWorkoutTimers(initialRestPreset: RestTimerPreset = 90) {
  const [timers, setTimers] = useState<WorkoutTimers>({
    session: { isRunning: false, seconds: 0 },
    rest: { isRunning: false, seconds: 0 },
    restPreset: initialRestPreset
  })
  
  const sessionIntervalRef = useRef<NodeJS.Timeout>()
  const restIntervalRef = useRef<NodeJS.Timeout>()

  // Timer de sesión
  const startSessionTimer = useCallback(() => {
    setTimers(prev => ({
      ...prev,
      session: { 
        ...prev.session, 
        isRunning: true, 
        startTime: Date.now() - (prev.session.seconds * 1000)
      }
    }))

    sessionIntervalRef.current = setInterval(() => {
      setTimers(prev => ({
        ...prev,
        session: {
          ...prev.session,
          seconds: prev.session.startTime 
            ? Math.floor((Date.now() - prev.session.startTime) / 1000)
            : prev.session.seconds + 1
        }
      }))
    }, 1000)
  }, [])

  const pauseSessionTimer = useCallback(() => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current)
    }
    setTimers(prev => ({
      ...prev,
      session: { ...prev.session, isRunning: false, pausedTime: Date.now() }
    }))
  }, [])

  const stopSessionTimer = useCallback(() => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current)
    }
    setTimers(prev => ({
      ...prev,
      session: { isRunning: false, seconds: 0 }
    }))
  }, [])

  // Timer de descanso
  const startRestTimer = useCallback((durationSeconds?: number) => {
    const duration = durationSeconds || timers.restPreset
    
    setTimers(prev => ({
      ...prev,
      rest: { isRunning: true, seconds: duration }
    }))

    restIntervalRef.current = setInterval(() => {
      setTimers(prev => {
        const newSeconds = prev.rest.seconds - 1
        if (newSeconds <= 0) {
          if (restIntervalRef.current) {
            clearInterval(restIntervalRef.current)
          }
          return {
            ...prev,
            rest: { isRunning: false, seconds: 0 }
          }
        }
        return {
          ...prev,
          rest: { ...prev.rest, seconds: newSeconds }
        }
      })
    }, 1000)
  }, [timers.restPreset])

  const stopRestTimer = useCallback(() => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current)
    }
    setTimers(prev => ({
      ...prev,
      rest: { isRunning: false, seconds: 0 }
    }))
  }, [])

  const setRestPreset = useCallback((preset: RestTimerPreset) => {
    setTimers(prev => ({ ...prev, restPreset: preset }))
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current)
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    }
  }, [])

  return {
    timers,
    startSessionTimer,
    pauseSessionTimer,
    stopSessionTimer,
    startRestTimer,
    stopRestTimer,
    setRestPreset
  }
}

// =====================================================
// HOOK PARA DATOS HISTÓRICOS DE EJERCICIO
// =====================================================

export function useExerciseHistory(exerciseId: string) {
  const { user } = useAuth()
  const [lastPerformance, setLastPerformance] = useState<{
    weight?: number
    reps?: number
    date?: string
  } | null>(null)
  const [bestPerformance, setBestPerformance] = useState<{
    weight: number
    reps: number
    date: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !exerciseId) {
      setLastPerformance(null)
      setBestPerformance(null)
      setLoading(false)
      return
    }

    const loadHistory = async () => {
      try {
        setLoading(true)
        const [last, best] = await Promise.all([
          getLastExercisePerformance(user.id, exerciseId),
          getBestExercisePerformance(user.id, exerciseId)
        ])
        
        setLastPerformance(last)
        setBestPerformance(best)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading history')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user, exerciseId])

  return {
    lastPerformance,
    bestPerformance,
    loading,
    error,
    hasHistory: !!lastPerformance || !!bestPerformance
  }
}
