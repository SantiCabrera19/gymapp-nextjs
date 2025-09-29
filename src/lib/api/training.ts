import { supabase } from '@/lib/supabase'
import type { WorkoutSession } from '@/types/training'
import { WORKOUT_STATUS, transformWorkoutSessionFromDB } from '@/types/training'

// =====================================================
// VERSIÓN SIMPLIFICADA PARA EVITAR ERRORES DE TIPOS
// =====================================================

export async function getUserWorkoutHistory(
  userId: string,
  limit: number = 20
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed') // Usar status completed
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).map(transformWorkoutSessionFromDB)
}

export async function createWorkoutSession(
  userId: string,
  data: { name?: string; notes?: string; location?: string; routine_id?: string } = {}
): Promise<WorkoutSession> {
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      name: data.name || `Entrenamiento ${new Date().toLocaleDateString()}`,
      session_date: new Date().toISOString().split('T')[0], // Requerido por la estructura actual
      started_at: new Date().toISOString(),
      notes: data.notes || null,
      location: data.location || null,
      routine_id: data.routine_id || null,
      status: 'active',
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
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching active session:', error)
    throw error
  }

  // Si no hay datos, retornar null (no hay sesión activa)
  if (!data || data.length === 0) {
    return null
  }

  return transformWorkoutSessionFromDB(data[0])
}

export async function completeWorkoutSession(
  sessionId: string,
  totalDurationSeconds: number = 0
): Promise<WorkoutSession> {
  const now = new Date().toISOString()

  const { data: session, error } = await supabase
    .from('workout_sessions')
    .update({
      status: 'completed',
      completed_at: now,
      total_duration_seconds: totalDurationSeconds,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return transformWorkoutSessionFromDB(session)
}

export async function cancelWorkoutSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw error
}
