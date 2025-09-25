import { supabase } from '@/lib/supabase'
import { RoutineData } from '@/hooks/useRoutineBuilder'

export interface Routine {
  id: string
  user_id: string
  name: string
  description?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
  exercises?: RoutineExercise[]
}

export interface RoutineExercise {
  id: string
  routine_id: string
  exercise_id: string
  order: number
  sets: number
  reps: number
  rest_seconds: number
  notes?: string
  exercise?: {
    id: string
    name: string
    muscle_group_primary: string
    difficulty_level: string
    image_url?: string
  }
}

// =====================================================
// RUTINAS - CRUD OPERATIONS
// =====================================================

export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (
          id,
          name,
          muscle_group_primary,
          difficulty_level,
          image_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getRoutineById(routineId: string, userId: string): Promise<Routine | null> {
  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (
          id,
          name,
          muscle_group_primary,
          difficulty_level,
          image_url,
          description,
          equipment_needed
        )
      )
    `)
    .eq('id', routineId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function createRoutine(userId: string, routineData: RoutineData): Promise<Routine> {
  // 1. Crear la rutina
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: routineData.name,
      description: routineData.description,
      difficulty_level: routineData.difficulty_level,
      estimated_duration_minutes: routineData.estimated_duration_minutes,
      is_active: true
    })
    .select()
    .single()

  if (routineError) throw routineError

  // 2. Agregar ejercicios si los hay
  if (routineData.exercises.length > 0) {
    const exerciseInserts = routineData.exercises.map(exercise => ({
      routine_id: routine.id,
      exercise_id: exercise.id,
      order: exercise.order,
      sets: exercise.sets || 3,
      reps: exercise.reps || 10,
      rest_seconds: exercise.rest_seconds || 60,
      notes: exercise.notes
    }))

    const { error: exercisesError } = await supabase
      .from('routine_exercises')
      .insert(exerciseInserts)

    if (exercisesError) throw exercisesError
  }

  // 3. Retornar rutina completa
  return getRoutineById(routine.id, userId) as Promise<Routine>
}

export async function updateRoutine(
  routineId: string, 
  userId: string, 
  updates: Partial<RoutineData>
): Promise<Routine> {
  // 1. Actualizar información básica
  const { error: routineError } = await supabase
    .from('routines')
    .update({
      name: updates.name,
      description: updates.description,
      difficulty_level: updates.difficulty_level,
      estimated_duration_minutes: updates.estimated_duration_minutes,
      updated_at: new Date().toISOString()
    })
    .eq('id', routineId)
    .eq('user_id', userId)

  if (routineError) throw routineError

  // 2. Si hay ejercicios, actualizar la lista completa
  if (updates.exercises) {
    // Eliminar ejercicios existentes
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', routineId)

    if (deleteError) throw deleteError

    // Insertar nuevos ejercicios
    if (updates.exercises.length > 0) {
      const exerciseInserts = updates.exercises.map(exercise => ({
        routine_id: routineId,
        exercise_id: exercise.id,
        order: exercise.order,
        sets: exercise.sets || 3,
        reps: exercise.reps || 10,
        rest_seconds: exercise.rest_seconds || 60,
        notes: exercise.notes
      }))

      const { error: insertError } = await supabase
        .from('routine_exercises')
        .insert(exerciseInserts)

      if (insertError) throw insertError
    }
  }

  // 3. Retornar rutina actualizada
  return getRoutineById(routineId, userId) as Promise<Routine>
}

export async function deleteRoutine(routineId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', routineId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function duplicateRoutine(routineId: string, userId: string, newName?: string): Promise<Routine> {
  // 1. Obtener rutina original
  const originalRoutine = await getRoutineById(routineId, userId)
  if (!originalRoutine) throw new Error('Rutina no encontrada')

  // 2. Crear nueva rutina
  const routineData: RoutineData = {
    name: newName || `${originalRoutine.name} (Copia)`,
    description: originalRoutine.description,
    difficulty_level: originalRoutine.difficulty_level,
    estimated_duration_minutes: originalRoutine.estimated_duration_minutes,
    exercises: originalRoutine.routine_exercises?.map(re => ({
      ...re.exercise!,
      order: re.order,
      sets: re.sets,
      reps: re.reps,
      rest_seconds: re.rest_seconds,
      notes: re.notes
    })) || []
  }

  return createRoutine(userId, routineData)
}

// =====================================================
// RUTINAS - OPERACIONES ESPECIALES
// =====================================================

export async function getPopularRoutines(limit: number = 10): Promise<Routine[]> {
  // Esta función podría implementarse con métricas de uso
  // Por ahora, retorna rutinas públicas más recientes
  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (
          id,
          name,
          muscle_group_primary,
          difficulty_level,
          image_url
        )
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function searchRoutines(query: string, userId?: string): Promise<Routine[]> {
  let queryBuilder = supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (
          id,
          name,
          muscle_group_primary,
          difficulty_level,
          image_url
        )
      )
    `)
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(20)

  if (userId) {
    queryBuilder = queryBuilder.eq('user_id', userId)
  }

  const { data, error } = await queryBuilder

  if (error) throw error
  return data || []
}
