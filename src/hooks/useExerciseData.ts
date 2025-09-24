'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import {
  getExerciseRecords,
  getExerciseStats,
  getExerciseProgress,
  toggleExerciseFavorite
} from '@/lib/api/user-exercises'
import type {
  ExerciseRecord,
  ExerciseStats,
  ProgressDataPoint,
  ChartDataPoint
} from '@/types/user-exercises'

// =====================================================
// HOOK PARA RECORDS DE EJERCICIO
// =====================================================

export function useExerciseRecords(exerciseId: string) {
  const { user } = useAuth()
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !exerciseId) {
      setRecords([])
      setLoading(false)
      return
    }

    const loadRecords = async () => {
      try {
        setLoading(true)
        const data = await getExerciseRecords(user.id, exerciseId)
        setRecords(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading records')
        setRecords([])
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [user, exerciseId])

  return { records, loading, error, hasData: records.length > 0 }
}

// =====================================================
// HOOK PARA ESTADÍSTICAS DE EJERCICIO
// =====================================================

export function useExerciseStats(exerciseId: string) {
  const { user } = useAuth()
  const [stats, setStats] = useState<ExerciseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !exerciseId) {
      setStats(null)
      setLoading(false)
      return
    }

    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getExerciseStats(user.id, exerciseId)
        setStats(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading stats')
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user, exerciseId])

  return { stats, loading, error, hasData: !!stats }
}

// =====================================================
// HOOK PARA PROGRESO DE EJERCICIO
// =====================================================

export function useExerciseProgress(exerciseId: string, months: number = 6) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !exerciseId) {
      setProgress([])
      setLoading(false)
      return
    }

    const loadProgress = async () => {
      try {
        setLoading(true)
        const data = await getExerciseProgress(user.id, exerciseId, months)
        setProgress(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading progress')
        setProgress([])
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [user, exerciseId, months])

  return { 
    progress, 
    loading, 
    error, 
    hasData: progress.length > 0,
    // Datos transformados para gráficos
    chartData: {
      weight: progress.map(p => ({ 
        date: p.date, 
        value: p.weight || 0, 
        label: `${p.weight || 0}kg` 
      })),
      volume: progress.map(p => ({ 
        date: p.date, 
        value: p.volume || 0, 
        label: `${p.volume || 0}kg` 
      })),
      reps: progress.map(p => ({ 
        date: p.date, 
        value: p.reps || 0, 
        label: `${p.reps || 0} reps` 
      }))
    }
  }
}

// =====================================================
// HOOK PARA FAVORITOS
// =====================================================

export function useExerciseFavorite(exerciseId: string, initialIsFavorite: boolean = false) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = async () => {
    if (!user) {
      setError('Debes iniciar sesión para marcar favoritos')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await toggleExerciseFavorite(user.id, exerciseId)
      setIsFavorite(result.isFavorite)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating favorite')
    } finally {
      setLoading(false)
    }
  }

  return { isFavorite, toggle, loading, error }
}

// =====================================================
// HOOK COMBINADO PARA PÁGINA DE DETALLE
// =====================================================

export function useExerciseDetail(exerciseId: string) {
  const { user, isAuthenticated } = useAuth()
  const records = useExerciseRecords(exerciseId)
  const stats = useExerciseStats(exerciseId)
  const progress = useExerciseProgress(exerciseId)

  const isLoading = records.loading || stats.loading || progress.loading
  const hasAnyData = records.hasData || stats.hasData || progress.hasData

  return {
    isAuthenticated,
    isLoading,
    hasAnyData,
    records: records.records,
    stats: stats.stats,
    progress: progress.chartData,
    errors: {
      records: records.error,
      stats: stats.error,
      progress: progress.error
    }
  }
}
