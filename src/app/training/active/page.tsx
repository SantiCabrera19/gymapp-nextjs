'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Plus, Dumbbell, Clock, Target } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExerciseTimer, useExerciseTimer } from '@/components/training/ExerciseTimer'
import { SetTracker } from '@/components/training/SetTracker'
import { useTraining } from '@/hooks/useTraining'
import { useAuth } from '@/hooks'
import { getExercises } from '@/lib/api/exercises'
import { type Exercise } from '@/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ActiveTrainingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    activeSession,
    loading,
    initialized,
    isActive,
    isPaused,
    completeWorkout,
    pauseWorkout,
    resumeWorkout,
    cancelWorkout,
  } = useTraining()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [exercisesLoading, setExercisesLoading] = useState(false)
  const [workoutStartTime] = useState(Date.now())

  // Timer hooks
  const {
    currentExerciseTime,
    totalWorkoutTime,
    handleExerciseTimeUpdate,
    resetExerciseTimer,
    addToTotalTime,
  } = useExerciseTimer()

  // Cargar ejercicios
  useEffect(() => {
    const loadExercises = async () => {
      if (!user) return

      try {
        setExercisesLoading(true)
        const data = await getExercises(user.id)
        setExercises(data)
      } catch (error) {
        console.error('Error loading exercises:', error)
      } finally {
        setExercisesLoading(false)
      }
    }

    loadExercises()
  }, [user])

  // Redirigir SOLO si está inicializado y no hay sesión activa
  useEffect(() => {
    if (initialized && !activeSession && !loading) {
      router.push('/training')
    }
  }, [activeSession, loading, initialized, router])

  const filteredExercises = exercises.filter(
    exercise =>
      exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      exercise.muscle_group_primary.toLowerCase().includes(exerciseSearch.toLowerCase())
  )

  const handleCompleteWorkout = async () => {
    const totalDuration = Math.floor((Date.now() - workoutStartTime) / 1000)
    await completeWorkout(totalDuration)
  }

  const handleExerciseComplete = () => {
    if (selectedExercise && currentExerciseTime > 0) {
      addToTotalTime(currentExerciseTime)
      resetExerciseTimer()
      setSelectedExercise(null)
    }
  }

  const formatWorkoutDuration = () => {
    const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000)
    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePauseWorkout = async () => {
    await pauseWorkout()
  }

  const handleResumeWorkout = async () => {
    await resumeWorkout()
  }

  const handleCancelWorkout = async () => {
    await cancelWorkout()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </AppLayout>
    )
  }

  if (!activeSession) {
    return (
      <AppLayout>
        <EmptyState
          icon={<ArrowLeft size={48} />}
          title="No hay sesión activa"
          description="No tienes una sesión de entrenamiento activa. Inicia una nueva sesión para continuar."
          action={{
            label: 'Volver a Training',
            onClick: () => (window.location.href = '/training'),
          }}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">{activeSession.name}</h1>
              <p className="text-sm text-slate-400">
                Iniciado: {new Date(activeSession.started_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de la sesión */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  isActive
                    ? 'bg-green-400 animate-pulse'
                    : isPaused
                      ? 'bg-yellow-400'
                      : 'bg-slate-500'
                )}
              />
              <span className="text-white font-medium">
                {isActive
                  ? 'Entrenamiento Activo'
                  : isPaused
                    ? 'Entrenamiento Pausado'
                    : 'Estado Desconocido'}
              </span>
            </div>
            <div className="text-sm text-slate-400">Sesión en progreso</div>
          </div>
        </Card>

        {/* Selector de Ejercicio */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Seleccionar Ejercicio</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExerciseSelector(!showExerciseSelector)}
              >
                {showExerciseSelector ? 'Ocultar' : 'Mostrar'} Lista
              </Button>
            </div>

            {showExerciseSelector && (
              <div className="space-y-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar ejercicio..."
                    value={exerciseSearch}
                    onChange={e => setExerciseSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Lista de ejercicios */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {exercisesLoading ? (
                    <div className="text-center py-8 text-slate-400">Cargando ejercicios...</div>
                  ) : filteredExercises.length > 0 ? (
                    filteredExercises.map(exercise => (
                      <button
                        key={exercise.id}
                        onClick={() => {
                          setSelectedExercise(exercise)
                          setShowExerciseSelector(false)
                        }}
                        className="w-full p-3 text-left rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all"
                      >
                        <div className="font-medium text-white">{exercise.name}</div>
                        <div className="text-sm text-slate-400 capitalize">
                          {exercise.muscle_group_primary}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No se encontraron ejercicios
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedExercise && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-white font-medium">Ejercicio seleccionado:</div>
                <div className="text-blue-400">{selectedExercise.name}</div>
                <div className="text-sm text-slate-400 capitalize">
                  {selectedExercise.muscle_group_primary}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Controles de Entrenamiento */}
        <Card className="p-6 bg-background-tertiary border-border-secondary">
          <div className="space-y-4">
            <h4 className="font-medium text-white">Controles de Entrenamiento</h4>

            <div className="grid gap-3 md:grid-cols-3">
              {/* Pausa/Reanudar */}
              {isActive ? (
                <Button
                  variant="outline"
                  onClick={handlePauseWorkout}
                  disabled={loading}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  Pausar
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={handleResumeWorkout}
                  disabled={loading}
                  className="bg-accent-primary hover:bg-accent-hover"
                >
                  Reanudar
                </Button>
              ) : null}

              {/* Completar */}
              <Button
                onClick={handleCompleteWorkout}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                ✓ Completar
              </Button>

              {/* Cancelar */}
              <Button
                variant="outline"
                onClick={handleCancelWorkout}
                disabled={loading}
                className="border-status-error/30 text-status-error hover:bg-status-error/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
