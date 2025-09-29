import type { Tables } from './database'

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export const WORKOUT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type WorkoutStatus = (typeof WORKOUT_STATUS)[keyof typeof WORKOUT_STATUS]

export const SET_TYPES = {
  NORMAL: 'normal',
  WARMUP: 'warmup',
  FAILURE: 'failure',
  DROPSET: 'dropset',
} as const

export type SetType = (typeof SET_TYPES)[keyof typeof SET_TYPES]

// Configuración visual para tipos de series
export const SET_TYPE_CONFIG = {
  [SET_TYPES.NORMAL]: {
    label: 'Normal',
    code: 'N',
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  [SET_TYPES.WARMUP]: {
    label: 'Calentamiento',
    code: 'W',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20',
  },
  [SET_TYPES.FAILURE]: {
    label: 'Al Fallo',
    code: 'F',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/20',
  },
  [SET_TYPES.DROPSET]: {
    label: 'Dropset',
    code: 'D',
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
} as const

export const REST_TIMER_PRESETS = [30, 60, 90, 120, 180, 240] as const
export type RestTimerPreset = (typeof REST_TIMER_PRESETS)[number]

// =====================================================
// TIPOS BASE DESDE DATABASE
// =====================================================

type WorkoutSessionRow = Tables<'workout_sessions'>
type ExerciseSetRow = Tables<'exercise_sets'>

// =====================================================
// TIPOS DE API (LIMPIOS Y VALIDADOS)
// =====================================================

export interface WorkoutSession {
  id: string
  user_id: string
  name?: string
  routine_id?: string
  started_at: string
  ended_at?: string
  total_duration_seconds: number
  status: WorkoutStatus
  notes?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface ExerciseSet {
  id: string
  workout_session_id: string
  exercise_id: string
  set_number: number
  set_type: SetType
  weight_kg?: number
  reps_completed: number
  rpe_score?: number
  rest_duration_seconds?: number
  completed_at: string
  notes?: string
  created_at: string
}

// =====================================================
// TIPOS DERIVADOS PARA UI
// =====================================================

export interface ActiveWorkoutSession extends WorkoutSession {
  current_exercise_id?: string
  current_set_number: number
  is_resting: boolean
  rest_timer_seconds: number
  rest_timer_preset: RestTimerPreset
}

export interface ExerciseSetWithHistory extends ExerciseSet {
  exercise_name: string
  previous_weight?: number
  previous_reps?: number
  previous_date?: string
  is_personal_record: boolean
}

export interface WorkoutExercise {
  exercise_id: string
  exercise_name: string
  muscle_group: string
  sets: ExerciseSetWithHistory[]
  last_weight?: number
  last_reps?: number
  last_performed?: string
  total_sets: number
  completed_sets: number
}

export interface WorkoutSummary {
  session: WorkoutSession
  exercises: WorkoutExercise[]
  total_exercises: number
  total_sets: number
  total_volume_kg: number
  duration_formatted: string
  personal_records: number
}

// =====================================================
// TIPOS PARA TIMERS
// =====================================================

export interface TimerState {
  isRunning: boolean
  seconds: number
  startTime?: number
  pausedTime?: number
}

export interface WorkoutTimers {
  session: TimerState
  rest: TimerState
  restPreset: RestTimerPreset
}

// =====================================================
// TIPOS PARA FORMULARIOS
// =====================================================

export interface SetFormData {
  weight_kg: number | ''
  reps_completed: number | ''
  set_type: SetType
  rpe_score?: number
  notes?: string
}

export interface WorkoutFormData {
  name?: string
  notes?: string
  location?: string
  routine_id?: string
}

// =====================================================
// FUNCIONES DE VALIDACIÓN Y TRANSFORMACIÓN
// =====================================================

export function validateSetType(type: string): SetType {
  const validTypes = Object.values(SET_TYPES)
  if (validTypes.includes(type as SetType)) {
    return type as SetType
  }
  throw new Error(`Invalid set type: ${type}. Must be one of: ${validTypes.join(', ')}`)
}

export function validateWorkoutStatus(status: string): WorkoutStatus {
  const validStatuses = Object.values(WORKOUT_STATUS)
  if (validStatuses.includes(status as WorkoutStatus)) {
    return status as WorkoutStatus
  }
  throw new Error(`Invalid workout status: ${status}. Must be one of: ${validStatuses.join(', ')}`)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function calculateVolume(sets: ExerciseSet[]): number {
  return sets.reduce((total, set) => {
    return total + (set.weight_kg || 0) * set.reps_completed
  }, 0)
}

export function getSetDisplayNumber(setNumber: number, setType: SetType): string {
  const config = SET_TYPE_CONFIG[setType]
  if (setType === SET_TYPES.NORMAL) {
    return setNumber.toString()
  }
  return config.code
}

export function isPersonalRecord(
  currentWeight: number,
  currentReps: number,
  previousBest?: { weight: number; reps: number }
): boolean {
  if (!previousBest) return true

  // PR si el peso es mayor, o si el peso es igual pero las reps son mayores
  return (
    currentWeight > previousBest.weight ||
    (currentWeight === previousBest.weight && currentReps > previousBest.reps)
  )
}

// Transformar datos de DB a tipos de API
export function transformWorkoutSessionFromDB(session: any): WorkoutSession {
  if (!session.user_id || !session.started_at || !session.created_at) {
    throw new Error('Invalid workout session: missing required fields')
  }

  return {
    id: session.id,
    user_id: session.user_id,
    name: session.name || undefined,
    started_at: session.started_at,
    ended_at: session.ended_at || session.completed_at || undefined,
    total_duration_seconds:
      session.total_duration_seconds ||
      (session.total_duration_minutes ? session.total_duration_minutes * 60 : 0),
    status: validateWorkoutStatus(
      session.status || (session.completed_at ? 'completed' : 'active')
    ),
    notes: session.notes || undefined,
    location: session.location || undefined,
    created_at: session.created_at,
    updated_at: session.updated_at || session.created_at,
  }
}

export function transformExerciseSetFromDB(set: any): ExerciseSet {
  if (!set.session_id || !set.exercise_id || !set.completed_at || !set.created_at) {
    throw new Error('Invalid exercise set: missing required fields')
  }

  return {
    id: set.id,
    workout_session_id: set.session_id, // Mapear session_id a workout_session_id
    exercise_id: set.exercise_id,
    set_number: set.set_number || 1,
    set_type: validateSetType((set.set_type || 'normal') as string),
    weight_kg: set.weight_kg || undefined,
    reps_completed: set.reps_completed || 0,
    rpe_score: set.rpe_score || undefined,
    rest_duration_seconds: set.rest_duration_seconds || set.rest_taken_seconds || undefined,
    completed_at: set.completed_at,
    notes: set.notes || undefined,
    created_at: set.created_at,
  }
}
