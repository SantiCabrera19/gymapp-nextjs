import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'
import {
  type ExerciseRecord,
  type ExerciseStats,
  type ExerciseFavorite,
  type ProgressDataPoint,
  type ExerciseRecordWithExercise,
  type UserOverallStats,
  transformRecordFromDB,
  transformStatsFromDB,
  transformFavoriteFromDB,
  filterNulls,
  validateRecordType,
  statsToUserStats,
  RECORD_TYPES,
} from '@/types/user-exercises'

// Re-export para uso en exercises.ts
export { statsToUserStats } from '@/types/user-exercises'

// =====================================================
// FAVORITOS
// =====================================================

export async function getUserFavoriteExercises(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_exercise_favorites')
    .select('exercise_id')
    .eq('user_id', userId)


  // Filtrar nulls y retornar solo exercise_ids válidos
  return filterNulls(data?.map(item => item.exercise_id) || [])
}

export async function toggleExerciseFavorite(userId: string, exerciseId: string, isFavorite: boolean): Promise<{ isFavorite: boolean }> {
  // Verificar si ya existe
  const { data: existing } = await supabase
    .from('user_exercise_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single()

  if (existing) {
    // Eliminar favorito
    const { error } = await supabase
      .from('user_exercise_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)

    if (error) throw error
    return { isFavorite: false }
  } else {
    // Agregar favorito
    const { error } = await supabase
      .from('user_exercise_favorites')
      .insert({ user_id: userId, exercise_id: exerciseId })

    if (error) throw error
    return { isFavorite: true }
  }
}

// =====================================================
// RECORDS PERSONALES
// =====================================================

export async function getExerciseRecords(
  userId: string,
  exerciseId: string
): Promise<ExerciseRecord[]> {
  const { data, error } = await supabase
    .from('user_exercise_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('achieved_at', { ascending: false })

  if (error) throw error

  // Transformar y validar datos de DB
  return (data || []).map(transformRecordFromDB)
}

export async function getUserTopRecords(
  userId: string,
  limit: number = 10
): Promise<ExerciseRecordWithExercise[]> {
  const { data, error } = await supabase
    .from('user_exercise_records')
    .select(
      `
      *,
      exercise:exercises(name)
    `
    )
    .eq('user_id', userId)
    .eq('record_type', RECORD_TYPES.MAX_WEIGHT)
    .order('value', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Transformar y validar datos
  return (data || []).map(record => {
    const transformedRecord = transformRecordFromDB(record)
    return {
      ...transformedRecord,
      exercise_name: record.exercise?.name || 'Ejercicio desconocido',
    }
  })
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

export async function getExerciseStats(
  userId: string,
  exerciseId: string
): Promise<ExerciseStats | null> {
  const { data, error } = await supabase
    .from('user_exercise_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows

  // Transformar datos si existen
  return data ? transformStatsFromDB(data) : null
}

export async function getUserOverallStats(userId: string): Promise<UserOverallStats> {
  // Estadísticas generales del usuario
  const { data: stats, error: statsError } = await supabase
    .from('user_exercise_stats')
    .select('total_sessions, total_volume_kg, exercise:exercises(muscle_group_primary)')
    .eq('user_id', userId)

  if (statsError) throw statsError

  // Usar valores por defecto para nulls
  const totalWorkouts = stats?.reduce((sum, stat) => sum + (stat.total_sessions || 0), 0) || 0
  const totalVolume = stats?.reduce((sum, stat) => sum + (stat.total_volume_kg || 0), 0) || 0
  const totalExercises = stats?.length || 0

  // Grupo muscular favorito (más entrenado)
  const muscleGroups = stats?.map(stat => stat.exercise?.muscle_group_primary).filter(Boolean) || []
  const muscleGroupCounts = muscleGroups.reduce((acc: Record<string, number>, group) => {
    if (group) {
      acc[group] = (acc[group] || 0) + 1
    }
    return acc
  }, {})

  const favoriteMuscleGroup =
    Object.entries(muscleGroupCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'chest'

  return {
    total_workouts: totalWorkouts,
    total_exercises: totalExercises,
    total_volume_kg: totalVolume,
    favorite_muscle_group: favoriteMuscleGroup,
  }
}

// =====================================================
// PROGRESO HISTÓRICO
// =====================================================

export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  months: number = 6
): Promise<ProgressDataPoint[]> {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const { data, error } = await supabase
    .from('exercise_sets')
    .select(
      `
      completed_at,
      weight_kg,
      reps_completed,
      workout_sessions!inner(user_id)
    `
    )
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', userId)
    .gte('completed_at', startDate.toISOString())
    .order('completed_at')

  if (error) throw error

  // Agrupar por mes y calcular promedios
  const monthlyData: Record<string, { weights: number[]; reps: number[]; volumes: number[] }> = {}

  data?.forEach(set => {
    if (!set.completed_at) return

    const date = new Date(set.completed_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { weights: [], reps: [], volumes: [] }
    }

    if (set.weight_kg) monthlyData[monthKey].weights.push(set.weight_kg)
    if (set.reps_completed) monthlyData[monthKey].reps.push(set.reps_completed)
    if (set.weight_kg && set.reps_completed) {
      monthlyData[monthKey].volumes.push(set.weight_kg * set.reps_completed)
    }
  })

  // Convertir a formato de gráfico
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      date: month,
      weight: data.weights.length > 0 ? Math.max(...data.weights) : undefined,
      volume: data.volumes.length > 0 ? data.volumes.reduce((a, b) => a + b, 0) : undefined,
      reps: data.reps.length > 0 ? Math.max(...data.reps) : undefined,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// =====================================================
// EJERCICIOS CON DATOS DE USUARIO
// =====================================================

export async function getExercisesWithUserData(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      exercise_muscles (
        involvement_level,
        intensity,
        muscle:muscles (*)
      ),
      user_exercise_favorites!left (
        id
      ),
      user_exercise_stats!left (
        total_sessions,
        last_performed_at
      )
    `
    )
    .eq('is_approved', true)
    .eq('user_exercise_favorites.user_id', userId)
    .eq('user_exercise_stats.user_id', userId)
    .order('name')

  if (error) throw error

  // Transformar datos para incluir is_favorite
  return (
    data?.map(exercise => ({
      ...exercise,
      is_favorite: exercise.user_exercise_favorites?.length > 0,
      user_stats: exercise.user_exercise_stats?.[0] || null,
    })) || []
  )
}
