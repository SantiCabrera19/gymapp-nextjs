'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import { useLoadingTimeout } from './useLoadingTimeout'
import { Exercise, ExerciseFilters } from '@/types/exercises'
import { getExercises, getRecommendedExercises } from '../lib/api/exercises'

const initialFilters: ExerciseFilters = {
  search: '',
  muscleGroups: [],
  equipment: [],
  difficulty: [],
  isFavorite: false,
  recommendedOnly: false,
}

export function useExercises() {
  const { user, profile } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Hook de timeout para prevenir loading infinito
  const {
    isLoading,
    hasTimedOut,
    error: timeoutError,
    startLoading,
    stopLoading,
    retry: retryTimeout,
  } = useLoadingTimeout({
    timeout: 12000, // 12 segundos para exercises
    timeoutMessage: 'La carga de ejercicios está tardando más de lo esperado',
  })

  // Cargar ejercicios con timeout y error handling robusto
  useEffect(() => {
    let mounted = true

    const loadExercises = async () => {
      try {
        // Solo mostrar loading en primera carga o si no hay datos
        if (!hasLoaded) {
          startLoading()
        }

        const data =
          filters.recommendedOnly && profile
            ? await getRecommendedExercises(profile.experience_level || 'beginner')
            : await getExercises(user?.id)

        if (mounted) {
          setExercises(data)
          setHasLoaded(true)
          stopLoading() // Detener timeout exitosamente
        }
      } catch (error) {
        console.error('Error loading exercises:', error)
        if (mounted) {
          setExercises([])
          setHasLoaded(true)
          stopLoading(
            'Error cargando ejercicios: ' +
              (error instanceof Error ? error.message : 'Error desconocido')
          )
        }
      }
    }

    loadExercises()

    return () => {
      mounted = false
    }
  }, [filters.recommendedOnly, profile, user?.id, hasLoaded, startLoading, stopLoading])

  // Filtrar ejercicios
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Búsqueda por texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = exercise.name.toLowerCase().includes(searchLower)
        const matchesDescription = exercise.description?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription) return false
      }

      // Filtro por grupos musculares
      if (filters.muscleGroups.length > 0) {
        if (!filters.muscleGroups.includes(exercise.muscle_group_primary)) return false
      }

      // Filtro por equipamiento
      if (filters.equipment.length > 0) {
        if (!exercise.equipment || !filters.equipment.includes(exercise.equipment)) return false
      }

      // Filtro por dificultad
      if (filters.difficulty.length > 0) {
        if (!exercise.difficulty_level || !filters.difficulty.includes(exercise.difficulty_level))
          return false
      }

      // Filtro por favoritos
      if (filters.isFavorite && !exercise.is_favorite) return false

      return true
    })
  }, [exercises, filters])

  const updateFilter = (key: keyof ExerciseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  const retry = () => {
    setHasLoaded(false) // Forzar recarga
    retryTimeout()
  }

  return {
    exercises: filteredExercises,
    isFirstLoad: isLoading && !hasLoaded, // Solo true durante primera carga real
    isLoading,
    hasTimedOut,
    error: timeoutError,
    filters,
    updateFilter,
    resetFilters,
    totalCount: exercises.length,
    filteredCount: filteredExercises.length,
    retry,
  }
}
