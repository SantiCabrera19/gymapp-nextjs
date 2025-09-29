import type { Tables } from './database'

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export const RECORD_TYPES = {
  MAX_WEIGHT: 'max_weight',
  MAX_REPS: 'max_reps',
  BEST_VOLUME: 'best_volume',
  ONE_RM: 'one_rm',
} as const

export type RecordType = (typeof RECORD_TYPES)[keyof typeof RECORD_TYPES]

export const PROGRESS_TRENDS = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DECLINING: 'declining',
} as const

export type ProgressTrend = (typeof PROGRESS_TRENDS)[keyof typeof PROGRESS_TRENDS]

// =====================================================
// TIPOS BASE DESDE DATABASE (CON VALIDACIONES)
// =====================================================

// Tipo base de la DB con campos requeridos validados
type UserExerciseRecordRow = Tables<'user_exercise_records'>
type UserExerciseStatsRow = Tables<'user_exercise_stats'>
type UserExerciseFavoriteRow = Tables<'user_exercise_favorites'>

// =====================================================
// TIPOS DE API (LIMPIOS Y VALIDADOS)
// =====================================================

export interface ExerciseRecord {
  id: string
  user_id: string
  exercise_id: string
  record_type: RecordType
  value: number
  secondary_value?: number
  achieved_at: string
  workout_session_id?: string
  created_at: string
}

export interface ExerciseStats {
  id: string
  user_id: string
  exercise_id: string
  total_sessions: number
  total_sets: number
  total_reps: number
  total_volume_kg: number
  best_weight_kg?: number
  best_reps?: number
  estimated_1rm_kg?: number
  last_performed_at?: string
  first_performed_at?: string
  created_at: string
  updated_at: string
}

export interface ExerciseFavorite {
  id: string
  user_id: string
  exercise_id: string
  created_at: string
}

// =====================================================
// TIPOS DERIVADOS PARA UI
// =====================================================

export interface ExerciseUserStats {
  last_performed?: string
  best_weight?: number
  best_reps?: number
  total_sessions: number
  progress_trend: ProgressTrend
}

export interface ProgressDataPoint {
  date: string
  weight?: number
  volume?: number
  reps?: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label: string
}

export interface ChartData {
  weight: ChartDataPoint[]
  volume: ChartDataPoint[]
  reps: ChartDataPoint[]
}

// =====================================================
// TIPOS DE RESPUESTA DE API
// =====================================================

export interface ExerciseRecordWithExercise extends ExerciseRecord {
  exercise_name: string
}

export interface UserOverallStats {
  total_workouts: number
  total_exercises: number
  total_volume_kg: number
  favorite_muscle_group: string
}

// =====================================================
// FUNCIONES DE VALIDACIÓN Y TRANSFORMACIÓN
// =====================================================

export function validateRecordType(type: string): RecordType {
  const validTypes = Object.values(RECORD_TYPES)
  if (validTypes.includes(type as RecordType)) {
    return type as RecordType
  }
  throw new Error(`Invalid record type: ${type}. Must be one of: ${validTypes.join(', ')}`)
}

export function calculateProgressTrend(currentValue: number, previousValue: number): ProgressTrend {
  const changePercent = ((currentValue - previousValue) / previousValue) * 100

  if (changePercent > 5) return PROGRESS_TRENDS.IMPROVING
  if (changePercent < -5) return PROGRESS_TRENDS.DECLINING
  return PROGRESS_TRENDS.STABLE
}

// Transformar datos de DB a tipos de API (limpiando nulls)
export function transformRecordFromDB(record: UserExerciseRecordRow): ExerciseRecord {
  if (!record.user_id || !record.exercise_id || !record.achieved_at || !record.created_at) {
    throw new Error('Invalid record: missing required fields')
  }

  return {
    id: record.id,
    user_id: record.user_id,
    exercise_id: record.exercise_id,
    record_type: validateRecordType(record.record_type),
    value: record.value,
    secondary_value: record.secondary_value || undefined,
    achieved_at: record.achieved_at,
    workout_session_id: record.workout_session_id || undefined,
    created_at: record.created_at,
  }
}

export function transformStatsFromDB(stats: UserExerciseStatsRow): ExerciseStats {
  if (!stats.user_id || !stats.exercise_id || !stats.created_at || !stats.updated_at) {
    throw new Error('Invalid stats: missing required fields')
  }

  return {
    id: stats.id,
    user_id: stats.user_id,
    exercise_id: stats.exercise_id,
    total_sessions: stats.total_sessions || 0,
    total_sets: stats.total_sets || 0,
    total_reps: stats.total_reps || 0,
    total_volume_kg: stats.total_volume_kg || 0,
    best_weight_kg: stats.best_weight_kg || undefined,
    best_reps: stats.best_reps || undefined,
    estimated_1rm_kg: stats.estimated_1rm_kg || undefined,
    last_performed_at: stats.last_performed_at || undefined,
    first_performed_at: stats.first_performed_at || undefined,
    created_at: stats.created_at,
    updated_at: stats.updated_at,
  }
}

export function transformFavoriteFromDB(favorite: UserExerciseFavoriteRow): ExerciseFavorite {
  if (!favorite.user_id || !favorite.exercise_id || !favorite.created_at) {
    throw new Error('Invalid favorite: missing required fields')
  }

  return {
    id: favorite.id,
    user_id: favorite.user_id,
    exercise_id: favorite.exercise_id,
    created_at: favorite.created_at,
  }
}

// Convertir ExerciseStats a ExerciseUserStats (para compatibilidad)
export function statsToUserStats(
  stats: ExerciseStats,
  previousStats?: ExerciseStats
): ExerciseUserStats {
  let progressTrend: ProgressTrend = PROGRESS_TRENDS.STABLE

  if (previousStats && stats.total_volume_kg > 0 && previousStats.total_volume_kg > 0) {
    progressTrend = calculateProgressTrend(stats.total_volume_kg, previousStats.total_volume_kg)
  }

  return {
    last_performed: stats.last_performed_at,
    best_weight: stats.best_weight_kg,
    best_reps: stats.best_reps,
    total_sessions: stats.total_sessions,
    progress_trend: progressTrend,
  }
}

// Filtrar arrays eliminando nulls
export function filterNulls<T>(array: (T | null)[]): T[] {
  return array.filter((item): item is T => item !== null)
}
