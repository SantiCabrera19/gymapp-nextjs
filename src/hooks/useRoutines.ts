'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { getUserRoutines, deleteRoutine, duplicateRoutine, type Routine } from '@/lib/api/routines'

export interface RoutineFilters {
  search: string
  difficulty: string[]
  tags: string[]
  sortBy: 'name' | 'created_at' | 'duration' | 'exercises'
  sortOrder: 'asc' | 'desc'
}

const initialFilters: RoutineFilters = {
  search: '',
  difficulty: [],
  tags: [],
  sortBy: 'created_at',
  sortOrder: 'desc',
}

export function useRoutines() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [filters, setFilters] = useState<RoutineFilters>(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar rutinas del usuario
  const loadRoutines = useCallback(async () => {
    if (!user?.id) {
      setRoutines([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const userRoutines = await getUserRoutines(user.id)
      setRoutines(userRoutines)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading routines'
      setError(errorMessage)
      setRoutines([])

      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading routines:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Cargar rutinas al montar o cambiar usuario
  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  // Filtrar y ordenar rutinas
  const filteredRoutines = useMemo(() => {
    let filtered = [...routines]

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        routine =>
          routine.name.toLowerCase().includes(searchLower) ||
          routine.description?.toLowerCase().includes(searchLower) ||
          routine.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filtro por dificultad
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(routine => filters.difficulty.includes(routine.difficulty_level))
    }

    // Filtro por tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(routine => routine.tags?.some(tag => filters.tags.includes(tag)))
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'duration':
          aValue = a.estimated_duration_minutes
          bValue = b.estimated_duration_minutes
          break
        case 'exercises':
          aValue = a.exercises?.length || 0
          bValue = b.exercises?.length || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [routines, filters])

  // Actualizar filtros
  const updateFilter = useCallback(
    <K extends keyof RoutineFilters>(key: K, value: RoutineFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }))
    },
    []
  )

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  // Duplicar rutina
  const handleDuplicateRoutine = useCallback(
    async (routine: Routine, newName?: string) => {
      if (!user?.id) return

      try {
        setError(null)
        const duplicatedRoutine = await duplicateRoutine(routine.id, user.id, newName)
        setRoutines(prev => [duplicatedRoutine, ...prev])
        return duplicatedRoutine
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error duplicating routine'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [user?.id]
  )

  // Eliminar rutina
  const handleDeleteRoutine = useCallback(
    async (routineId: string) => {
      if (!user?.id) return

      try {
        setError(null)
        await deleteRoutine(routineId, user.id)
        setRoutines(prev => prev.filter(routine => routine.id !== routineId))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error deleting routine'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [user?.id]
  )

  // Obtener todas las etiquetas únicas
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    routines.forEach(routine => {
      routine.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [routines])

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: routines.length,
      byDifficulty: {
        beginner: routines.filter(r => r.difficulty_level === 'beginner').length,
        intermediate: routines.filter(r => r.difficulty_level === 'intermediate').length,
        advanced: routines.filter(r => r.difficulty_level === 'advanced').length,
      },
      averageDuration:
        routines.length > 0
          ? Math.round(
              routines.reduce((sum, r) => sum + r.estimated_duration_minutes, 0) / routines.length
            )
          : 0,
      totalExercises: routines.reduce((sum, r) => sum + (r.exercises?.length || 0), 0),
    }
  }, [routines])

  return {
    // Estado
    routines: filteredRoutines,
    allRoutines: routines,
    filters,
    loading,
    error,
    stats,
    availableTags,

    // Acciones
    loadRoutines,
    updateFilter,
    resetFilters,
    handleDuplicateRoutine,
    handleDeleteRoutine,

    // Utilidades
    clearError: () => setError(null),
  }
}
