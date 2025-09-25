import { supabase } from '@/lib/supabase'
import type {
  WorkoutSession,
  ExerciseSet,
  WorkoutSummary,
  WorkoutExercise,
  ExerciseSetWithHistory,
  WorkoutFormData,
  SetFormData
} from '@/types/training'
import { 
  WORKOUT_STATUS,
  SET_TYPES,
  transformWorkoutSessionFromDB,
  transformExerciseSetFromDB,
  calculateVolume,
  formatDuration,
  isPersonalRecord
} from '@/types/training'

// =====================================================
// WORKOUT SESSIONS
// =====================================================

export async function createWorkoutSession(
  userId: string,
  data: WorkoutFormData = {}
): Promise<WorkoutSession> {
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      name: data.name || `Entrenamiento ${new Date().toLocaleDateString()}`,
      started_at: new Date().toISOString(),
      status: WORKOUT_STATUS.ACTIVE,
      notes: data.notes,
      location: data.location,
      total_duration_seconds: 0
    })
    .select()
    .single()

  if (error) throw error
  return transformWorkoutSessionFromDB(session)
}

export async function getActiveWorkoutSession(userId: string): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', WORKOUT_STATUS.ACTIVE)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data ? transformWorkoutSessionFromDB(data) : null
}

export async function updateWorkoutSession(
  sessionId: string,
  updates: Partial<WorkoutSession>
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return transformWorkoutSessionFromDB(data)
}

export async function completeWorkoutSession(
  sessionId: string,
  totalDurationSeconds: number
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      status: WORKOUT_STATUS.COMPLETED,
      ended_at: new Date().toISOString(),
      total_duration_seconds: totalDurationSeconds,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return transformWorkoutSessionFromDB(data)
}

export async function pauseWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  return updateWorkoutSession(sessionId, { 
    status: WORKOUT_STATUS.PAUSED,
    updated_at: new Date().toISOString()
  })
}

export async function resumeWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  return updateWorkoutSession(sessionId, { 
    status: WORKOUT_STATUS.ACTIVE,
    updated_at: new Date().toISOString()
  })
}

export async function cancelWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  return updateWorkoutSession(sessionId, { 
    status: WORKOUT_STATUS.CANCELLED,
    ended_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
}

// =====================================================
// EXERCISE SETS
// =====================================================

export async function addExerciseSet(
  sessionId: string,
  exerciseId: string,
  setData: SetFormData
): Promise<ExerciseSet> {
  // Obtener el número de serie siguiente
  const { data: existingSets } = await supabase
    .from('exercise_sets')
    .select('set_number')
    .eq('session_id', sessionId)  // Usar session_id en lugar de workout_session_id
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: false })
    .limit(1)

  const nextSetNumber = existingSets?.[0]?.set_number ? existingSets[0].set_number + 1 : 1

  const { data: set, error } = await supabase
    .from('exercise_sets')
    .insert({
      session_id: sessionId,  // Usar session_id en lugar de workout_session_id
      exercise_id: exerciseId,
      set_number: nextSetNumber,
      set_type: setData.set_type,
      weight_kg: setData.weight_kg || null,
      reps_completed: setData.reps_completed || 0,
      rpe_score: setData.rpe_score || null,
      rest_duration_seconds: null,  // Usar rest_duration_seconds
      notes: setData.notes || null,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return transformExerciseSetFromDB(set)
}

export async function updateExerciseSet(
  setId: string,
  updates: Partial<SetFormData>
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single()

  if (error) throw error
  return transformExerciseSetFromDB(data)
}

export async function deleteExerciseSet(setId: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('id', setId)

  if (error) throw error
}

export async function getWorkoutSets(sessionId: string): Promise<ExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('session_id', sessionId)  // Usar session_id en lugar de workout_session_id
    .order('completed_at', { ascending: true })

  if (error) throw error
  return (data || []).map(transformExerciseSetFromDB)
}

// =====================================================
// DATOS HISTÓRICOS Y REFERENCIAS
// =====================================================

export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  limit: number = 10
): Promise<ExerciseSetWithHistory[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      workout_sessions!inner (
        user_id,
        started_at
      ),
      exercises (
        name
      )
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map((set, index) => {
    const transformedSet = transformExerciseSetFromDB(set)
    const previousSet = data[index + 1]
    
    return {
      ...transformedSet,
      exercise_name: set.exercises?.name || 'Ejercicio desconocido',
      previous_weight: previousSet?.weight_kg || undefined,
      previous_reps: previousSet?.reps_completed || undefined,
      previous_date: previousSet?.completed_at || undefined,
      is_personal_record: false // Se calculará en el hook
    }
  })
}

export async function getLastExercisePerformance(
  userId: string,
  exerciseId: string
): Promise<{ weight?: number; reps?: number; date?: string } | null> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      weight_kg,
      reps_completed,
      completed_at,
      workout_sessions!inner (user_id)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', userId)
    .eq('set_type', SET_TYPES.NORMAL)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  return data ? {
    weight: data.weight_kg || undefined,
    reps: data.reps_completed || undefined,
    date: data.completed_at || undefined
  } : null
}

export async function getBestExercisePerformance(
  userId: string,
  exerciseId: string
): Promise<{ weight: number; reps: number; date: string } | null> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      weight_kg,
      reps_completed,
      completed_at,
      workout_sessions!inner (user_id)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', userId)
    .eq('set_type', SET_TYPES.NORMAL)
    .not('weight_kg', 'is', null)
    .order('weight_kg', { ascending: false })
    .order('reps_completed', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  return data ? {
    weight: data.weight_kg!,
    reps: data.reps_completed!,
    date: data.completed_at!
  } : null
}

// =====================================================
// RESUMEN Y ESTADÍSTICAS
// =====================================================

export async function getWorkoutSummary(sessionId: string): Promise<WorkoutSummary> {
  // Obtener sesión
  const { data: sessionData, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError) throw sessionError
  const session = transformWorkoutSessionFromDB(sessionData)

  // Obtener sets con información de ejercicios
  const { data: setsData, error: setsError } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      exercises (
        name,
        muscle_group_primary
      )
    `)
    .eq('workout_session_id', sessionId)
    .order('completed_at', { ascending: true })

  if (setsError) throw setsError

  // Agrupar por ejercicio
  const exerciseGroups: Record<string, any[]> = {}
  let personalRecords = 0

  setsData?.forEach(set => {
    const exerciseId = set.exercise_id
    if (!exerciseGroups[exerciseId]) {
      exerciseGroups[exerciseId] = []
    }
    exerciseGroups[exerciseId].push(set)
  })

  // Crear WorkoutExercise para cada grupo
  const exercises: WorkoutExercise[] = Object.entries(exerciseGroups).map(([exerciseId, sets]) => {
    const firstSet = sets[0]
    const transformedSets = sets.map(transformExerciseSetFromDB)
    
    return {
      exercise_id: exerciseId,
      exercise_name: firstSet.exercises?.name || 'Ejercicio desconocido',
      muscle_group: firstSet.exercises?.muscle_group_primary || 'unknown',
      sets: transformedSets.map(set => ({
        ...set,
        exercise_name: firstSet.exercises?.name || 'Ejercicio desconocido',
        is_personal_record: false // Se calculará después si es necesario
      })),
      total_sets: sets.length,
      completed_sets: sets.length,
      last_weight: sets[sets.length - 1]?.weight_kg || undefined,
      last_reps: sets[sets.length - 1]?.reps_completed || undefined
    }
  })

  const totalSets = setsData?.length || 0
  const totalVolume = calculateVolume(setsData?.map(transformExerciseSetFromDB) || [])

  return {
    session,
    exercises,
    total_exercises: exercises.length,
    total_sets: totalSets,
    total_volume_kg: totalVolume,
    duration_formatted: formatDuration(session.total_duration_seconds),
    personal_records: personalRecords
  }
}

export async function getUserWorkoutHistory(
  userId: string,
  limit: number = 20
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .in('status', [WORKOUT_STATUS.COMPLETED, WORKOUT_STATUS.CANCELLED])
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).map(transformWorkoutSessionFromDB)
}

// =====================================================
// UTILIDADES PARA TIMERS
// =====================================================

export async function updateSessionDuration(
  sessionId: string,
  durationSeconds: number
): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ 
      total_duration_seconds: durationSeconds,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) throw error
}

export async function addRestDurationToSet(
  setId: string,
  restDurationSeconds: number
): Promise<void> {
  const { error } = await supabase
    .from('exercise_sets')
    .update({ rest_duration_seconds: restDurationSeconds })
    .eq('id', setId)

  if (error) throw error
}
