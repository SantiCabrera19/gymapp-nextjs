'use client'

import { useState, useCallback } from 'react'
import { Exercise } from '@/types/exercises'

export interface RoutineExercise extends Exercise {
  order: number
  sets?: number
  reps?: number
  rest_seconds?: number
  notes?: string
}

export interface RoutineData {
  name: string
  description?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_minutes: number
  exercises: RoutineExercise[]
}

export function useRoutineBuilder(initialData?: Partial<RoutineData>) {
  const [routine, setRoutine] = useState<RoutineData>({
    name: '',
    description: '',
    difficulty_level: 'beginner',
    estimated_duration_minutes: 60,
    exercises: [],
    ...initialData,
  })

  const [isModified, setIsModified] = useState(false)

  // Actualizar información básica de la rutina
  const updateRoutineInfo = useCallback((updates: Partial<Omit<RoutineData, 'exercises'>>) => {
    setRoutine(prev => ({ ...prev, ...updates }))
    setIsModified(true)
  }, [])

  // Agregar ejercicio a la rutina
  const addExercise = useCallback((exercise: Exercise) => {
    setRoutine(prev => {
      const exists = prev.exercises.find(ex => ex.id === exercise.id)
      if (exists) return prev // No agregar duplicados

      const newExercise: RoutineExercise = {
        ...exercise,
        order: prev.exercises.length + 1,
        sets: 3,
        reps: 10,
        rest_seconds: 60,
      }

      return {
        ...prev,
        exercises: [...prev.exercises, newExercise],
      }
    })
    setIsModified(true)
  }, [])

  // Remover ejercicio de la rutina
  const removeExercise = useCallback((exerciseId: string) => {
    setRoutine(prev => ({
      ...prev,
      exercises: prev.exercises
        .filter(ex => ex.id !== exerciseId)
        .map((ex, index) => ({ ...ex, order: index + 1 })), // Reordenar
    }))
    setIsModified(true)
  }, [])

  // Reordenar ejercicios
  const reorderExercises = useCallback((fromIndex: number, toIndex: number) => {
    setRoutine(prev => {
      const exercises = [...prev.exercises]
      const [removed] = exercises.splice(fromIndex, 1)
      exercises.splice(toIndex, 0, removed)

      // Actualizar orden
      const reordered = exercises.map((ex, index) => ({ ...ex, order: index + 1 }))

      return { ...prev, exercises: reordered }
    })
    setIsModified(true)
  }, [])

  // Actualizar configuración de ejercicio
  const updateExerciseConfig = useCallback(
    (
      exerciseId: string,
      config: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'rest_seconds' | 'notes'>>
    ) => {
      setRoutine(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex => (ex.id === exerciseId ? { ...ex, ...config } : ex)),
      }))
      setIsModified(true)
    },
    []
  )

  // Agregar múltiples ejercicios
  const addMultipleExercises = useCallback((exercises: Exercise[]) => {
    setRoutine(prev => {
      const existingIds = new Set(prev.exercises.map(ex => ex.id))
      const newExercises = exercises
        .filter(ex => !existingIds.has(ex.id))
        .map(
          (exercise, index): RoutineExercise => ({
            ...exercise,
            order: prev.exercises.length + index + 1,
            sets: 3,
            reps: 10,
            rest_seconds: 60,
          })
        )

      return {
        ...prev,
        exercises: [...prev.exercises, ...newExercises],
      }
    })
    setIsModified(true)
  }, [])

  // Calcular duración estimada basada en ejercicios
  const calculateEstimatedDuration = useCallback(() => {
    const totalSets = routine.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)
    const totalRestTime = routine.exercises.reduce(
      (sum, ex) => sum + (ex.rest_seconds || 0) * (ex.sets || 0),
      0
    )
    const exerciseTime = totalSets * 45 // 45 segundos promedio por set
    const warmupCooldown = 10 // 10 minutos de calentamiento y enfriamiento

    return Math.ceil((exerciseTime + totalRestTime) / 60) + warmupCooldown
  }, [routine.exercises])

  // Validar rutina
  const validateRoutine = useCallback(() => {
    const errors: string[] = []

    if (!routine.name.trim()) {
      errors.push('El nombre de la rutina es requerido')
    }

    if (routine.exercises.length === 0) {
      errors.push('La rutina debe tener al menos un ejercicio')
    }

    if (routine.exercises.length > 15) {
      errors.push('La rutina no puede tener más de 15 ejercicios')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [routine])

  // Reset rutina
  const resetRoutine = useCallback(() => {
    setRoutine({
      name: '',
      description: '',
      difficulty_level: 'beginner',
      estimated_duration_minutes: 60,
      exercises: [],
    })
    setIsModified(false)
  }, [])

  return {
    routine,
    isModified,
    updateRoutineInfo,
    addExercise,
    removeExercise,
    reorderExercises,
    updateExerciseConfig,
    addMultipleExercises,
    calculateEstimatedDuration,
    validateRoutine,
    resetRoutine,
  }
}
