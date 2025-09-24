import { Tables } from './database'

export interface Exercise extends Tables<'exercises'> {
  muscles?: ExerciseMuscle[]
  user_stats?: ExerciseUserStats
  is_favorite?: boolean
}

export interface ExerciseMuscle {
  muscle: Tables<'muscles'>
  involvement_level: 'primary' | 'secondary' | 'stabilizer'
  intensity: number
}

export interface ExerciseUserStats {
  last_performed?: string
  best_weight?: number
  best_reps?: number
  total_sessions: number
  progress_trend: 'improving' | 'stable' | 'declining'
}

export interface ExerciseFilters {
  search: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string[]
  isFavorite: boolean
  recommendedOnly: boolean
}

export const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Pecho', icon: '💪', color: 'bg-red-500' },
  { id: 'back', name: 'Espalda', icon: '🏃', color: 'bg-blue-500' },
  { id: 'legs', name: 'Piernas', icon: '🦵', color: 'bg-green-500' },
  { id: 'shoulders', name: 'Hombros', icon: '🏋️', color: 'bg-yellow-500' },
  { id: 'arms', name: 'Brazos', icon: '💪', color: 'bg-purple-500' },
  { id: 'core', name: 'Core', icon: '🔥', color: 'bg-orange-500' }
] as const

export const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'bodyweight', 'machine', 'cable', 'kettlebell'
] as const

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Principiante', icon: '🟢' },
  { id: 'intermediate', name: 'Intermedio', icon: '🟡' },
  { id: 'advanced', name: 'Avanzado', icon: '🔴' }
] as const
