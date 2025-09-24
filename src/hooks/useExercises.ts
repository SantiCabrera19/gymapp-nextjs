'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import { Exercise, ExerciseFilters } from '@/types/exercises'
import { getExercises, getRecommendedExercises } from '../lib/api/exercises'

const initialFilters: ExerciseFilters = {
  search: '',
  muscleGroups: [],
  equipment: [],
  difficulty: [],
  isFavorite: false,
  recommendedOnly: false
}

export function useExercises() {
  const { user, profile } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters)
  const [isFirstLoad, setIsFirstLoad] = useState(true) // Solo para primera carga

  // Cargar ejercicios con loading inteligente
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = filters.recommendedOnly && profile
          ? await getRecommendedExercises(profile.experience_level || 'beginner')
          : await getExercises(user?.id) // Pasar userId para incluir favoritos
        
        setExercises(data)
        setIsFirstLoad(false) // Marcar que ya cargó una vez
      } catch (error) {
        console.error('Error loading exercises:', error)
        setExercises([])
        setIsFirstLoad(false)
      }
    }

    loadExercises()
  }, [filters.recommendedOnly, profile, user?.id])

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
        if (!exercise.difficulty_level || !filters.difficulty.includes(exercise.difficulty_level)) return false
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

  return {
    exercises: filteredExercises,
    isFirstLoad, // Solo true en la primera carga
    filters,
    updateFilter,
    resetFilters,
    totalCount: exercises.length,
    filteredCount: filteredExercises.length
  }
}
