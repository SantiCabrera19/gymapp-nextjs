'use client'

import { useState, useEffect } from 'react'
import { Play, Plus, Clock, TrendingUp, Calendar, Dumbbell, Target } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { AppLayout } from '@/components/layout/AppLayout'
import { useTraining } from '@/hooks/useTraining-simple'
import { useAuth, useAuthAction } from '@/hooks'
import { getUserWorkoutHistory } from '@/lib/api/training-simple'
import { formatDuration, type WorkoutSession } from '@/types/training'
import { type Routine } from '@/lib/api/routines'
import { RoutineSelector } from '@/components/routines/RoutineSelector'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TrainingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { requireAuth } = useAuthAction()
  const { activeSession, startWorkout, loading, initialized } = useTraining()
  
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [showRoutineSelector, setShowRoutineSelector] = useState(false)
  const [startingWorkout, setStartingWorkout] = useState(false)

  // Cargar historial SOLO una vez por usuario
  useEffect(() => {
    if (!user?.id) {
      setWorkoutHistory([])
      setHistoryLoading(false)
      return
    }

    let mounted = true

    const loadHistory = async () => {
      try {
        setHistoryLoading(true)
        const history = await getUserWorkoutHistory(user.id, 10)
        if (mounted) {
          setWorkoutHistory(history)
        }
      } catch (error) {
        console.error('Error loading workout history:', error)
        if (mounted) {
          setWorkoutHistory([])
        }
      } finally {
        if (mounted) {
          setHistoryLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      mounted = false
    }
  }, [user?.id])

  // Redirigir SOLO si hay sesión activa Y está inicializado
  useEffect(() => {
    if (initialized && activeSession && !loading) {
      router.push('/training/active')
    }
  }, [activeSession, initialized, loading, router])

  const handleStartWorkout = async () => {
    if (!isAuthenticated) {
      requireAuth(() => {})
      return
    }

    if (!selectedRoutine) {
      setShowRoutineSelector(true)
      return
    }

    try {
      setStartingWorkout(true)
      await startWorkout(selectedRoutine.id, {
        name: `${selectedRoutine.name} - ${new Date().toLocaleDateString()}`
      })
      // La redirección se maneja en el useEffect de arriba
    } catch (error) {
      console.error('Error starting workout:', error)
      setStartingWorkout(false)
    }
  }

  const handleCreateRoutine = () => {
    router.push('/routines/new')
  }

  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine)
    setShowRoutineSelector(false)
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <EmptyState
          icon={<Dumbbell size={48} />}
          title="Inicia Sesión para Entrenar"
          description="Necesitas estar autenticado para acceder al módulo de entrenamiento y registrar tus sesiones."
          action={{
            label: "Iniciar Sesión",
            onClick: () => requireAuth(() => {})
          }}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Entrenamiento</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Selecciona una rutina y registra tus entrenamientos con seguimiento en tiempo real.
        </p>
      </div>

      {/* Sesión activa o iniciar entrenamiento */}
      {activeSession ? (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Sesión Activa</h3>
              <p className="text-slate-300">{activeSession.name}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Iniciado: {new Date(activeSession.started_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>En progreso</span>
                </div>
              </div>
            </div>
            <Link href="/training/active">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                <Play size={20} className="mr-2" />
                Continuar Entrenamiento
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <Dumbbell size={32} className="text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">¿Listo para entrenar?</h3>
              <p className="text-slate-400">
                Inicia una nueva sesión de entrenamiento y registra tu progreso.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStartWorkout}
              disabled={loading}
              className="transition-all duration-200 hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Iniciando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus size={20} />
                  Iniciar Entrenamiento
                </div>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar size={24} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {workoutHistory.length}
          </div>
          <div className="text-sm text-slate-400">Entrenamientos completados</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {workoutHistory.length > 0 
              ? formatDuration(Math.round(workoutHistory.reduce((acc, w) => acc + w.total_duration_seconds, 0) / workoutHistory.length))
              : '0:00'
            }
          </div>
          <div className="text-sm text-slate-400">Duración promedio</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {workoutHistory.filter(w => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(w.started_at) > weekAgo
            }).length}
          </div>
          <div className="text-sm text-slate-400">Esta semana</div>
        </Card>
      </div>

      {/* Historial de entrenamientos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Entrenamientos Recientes</h2>
          {workoutHistory.length > 0 && (
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          )}
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : workoutHistory.length > 0 ? (
          <div className="space-y-3">
            {workoutHistory.slice(0, 5).map((workout) => (
              <Card key={workout.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-white">
                      {workout.name || 'Entrenamiento'}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{new Date(workout.started_at).toLocaleDateString()}</span>
                      <span>{formatDuration(workout.total_duration_seconds)}</span>
                      {workout.location && <span>{workout.location}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      workout.status === 'completed' 
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-500/20 text-slate-400"
                    )}>
                      {workout.status === 'completed' ? 'Completado' : 'Cancelado'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar size={48} />}
            title="Sin Entrenamientos Aún"
            description="Inicia tu primer entrenamiento para comenzar a registrar tu progreso."
            action={{
              label: "Iniciar Primer Entrenamiento",
              onClick: handleStartWorkout
            }}
          />
        )}
      </div>
      </div>
    </AppLayout>
  )
}
