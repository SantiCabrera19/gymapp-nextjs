import { supabase } from '@/lib/supabase'
import { Exercise } from '@/types/exercises'

export async function getExercises(userId?: string): Promise<Exercise[]> {
  if (userId) {
    // Si hay usuario, incluir datos personales
    const { getExercisesWithUserData } = await import('./user-exercises')
    return getExercisesWithUserData(userId)
  }

  // Sin usuario, datos básicos
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      exercise_muscles (
        involvement_level,
        intensity,
        muscle:muscles (*)
      )
    `
    )
    .eq('is_approved', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getRecommendedExercises(experienceLevel: string): Promise<Exercise[]> {
  // Algoritmo de recomendación basado en experiencia
  const difficultyMap = {
    beginner: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced: ['beginner', 'intermediate', 'advanced'],
  }

  const allowedDifficulties = difficultyMap[experienceLevel as keyof typeof difficultyMap] || [
    'beginner',
  ]

  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      exercise_muscles (
        involvement_level,
        intensity,
        muscle:muscles (*)
      )
    `
    )
    .eq('is_approved', true)
    .in('difficulty_level', allowedDifficulties)
    .order('name')
    .limit(50)

  if (error) throw error
  return data || []
}

export async function getExerciseById(id: string, userId?: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      exercise_muscles (
        involvement_level,
        intensity,
        muscle:muscles (*)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error

  // Si hay usuario, agregar datos personales
  if (userId && data) {
    const { getUserFavoriteExercises, getExerciseStats, statsToUserStats } = await import(
      './user-exercises'
    )

    const [favorites, stats] = await Promise.all([
      getUserFavoriteExercises(userId),
      getExerciseStats(userId, id),
    ])

    return {
      ...data,
      is_favorite: favorites.includes(id),
      user_stats: stats ? statsToUserStats(stats) : undefined,
    }
  }

  return data
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      exercise_muscles (
        involvement_level,
        intensity,
        muscle:muscles (*)
      )
    `
    )
    .eq('is_approved', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10)

  if (error) throw error
  return data || []
}
