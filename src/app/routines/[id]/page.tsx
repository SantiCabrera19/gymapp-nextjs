'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Edit, Copy, Trash2, Clock, Dumbbell, Target, Calendar } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card } from '@/components/ui'
import { Breadcrumbs } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { getRoutineById, duplicateRoutine, deleteRoutine, type Routine } from '@/lib/api/routines'
import { useAuth, useAuthAction } from '@/hooks'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface RoutinePageProps {
  params: {
    id: string
  }
}

export default function RoutinePage({ params }: RoutinePageProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { requireAuth } = useAuthAction()
  
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Cargar rutina
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadRoutine = async () => {
      try {
        setLoading(true)
        setError(null)
        const routineData = await getRoutineById(params.id, user.id)
        setRoutine(routineData)
      } catch (err) {
        console.error('Error loading routine:', err)
        setError(err instanceof Error ? err.message : 'Error loading routine')
      } finally {
        setLoading(false)
      }
    }

    loadRoutine()
  }, [params.id, user?.id])

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    requireAuth(() => router.push(`/routines/${params.id}`))
    return null
  }

  const handleStartTraining = () => {
    router.push(`/training?routine=${params.id}`)
  }

  const handleEdit = () => {
    router.push(`/routines/${params.id}/edit`)
  }

  const handleDuplicate = async () => {
    if (!routine || !user?.id) return

    try {
      setActionLoading('duplicate')
      const newName = `${routine.name} (Copia)`
      const duplicatedRoutine = await duplicateRoutine(routine.id, user.id, newName)
      router.push(`/routines/${duplicatedRoutine.id}`)
    } catch (error) {
      console.error('Error duplicating routine:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!routine || !user?.id) return

    if (!confirm(`¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?`)) {
      return
    }

    try {
      setActionLoading('delete')
      await deleteRoutine(routine.id, user.id)
      router.push('/routines')
    } catch (error) {
      console.error('Error deleting routine:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getDifficultyConfig = (level: string) => {
    switch (level) {
      case 'beginner':
        return { label: 'Principiante', color: 'text-green-400 bg-green-500/20 border-green-500/30' }
      case 'intermediate':
        return { label: 'Intermedio', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' }
      case 'advanced':
        return { label: 'Avanzado', color: 'text-red-400 bg-red-500/20 border-red-500/30' }
      default:
        return { label: level, color: 'text-text-secondary bg-background-card border-border-primary' }
    }
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
          <div className="h-6 bg-background-tertiary rounded animate-pulse" />
          <div className="h-8 bg-background-tertiary rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-background-tertiary rounded-lg animate-pulse" />
              <div className="h-96 bg-background-tertiary rounded-lg animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-background-tertiary rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (error || !routine) {
    return (
      <AppLayout>
        <div className="flex-1 space-y-6 p-6">
          <Breadcrumbs 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Rutinas', href: '/routines' },
              { label: 'Rutina', href: `/routines/${params.id}`, current: true }
            ]} 
          />

          <EmptyState
            icon={<Target size={48} />}
            title="Rutina no encontrada"
            description={error || "La rutina que buscas no existe o no tienes permisos para verla."}
            action={{
              label: "Volver a Rutinas",
              onClick: () => router.push('/routines')
            }}
          />
        </div>
      </AppLayout>
    )
  }

  const difficulty = getDifficultyConfig(routine.difficulty_level)
  const exerciseCount = routine.exercises?.length || 0
  const totalSets = routine.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0
  const muscleGroups = Array.from(new Set(routine.exercises?.map(ex => ex.exercise?.muscle_group_primary).filter(Boolean) || []))

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Rutinas', href: '/routines' },
            { label: routine.name, href: `/routines/${params.id}`, current: true }
          ]} 
        />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/routines')}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {routine.name}
              </h1>
              {routine.description && (
                <p className="text-text-secondary mt-1">
                  {routine.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDuplicate}
              disabled={actionLoading === 'duplicate'}
            >
              {actionLoading === 'duplicate' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Copy size={16} className="mr-2" />
              )}
              Duplicar
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEdit}
            >
              <Edit size={16} className="mr-2" />
              Editar
            </Button>
            
            <Button
              onClick={handleStartTraining}
              className="min-w-[140px]"
            >
              <Play size={16} className="mr-2" />
              Iniciar Entrenamiento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                    <Dumbbell size={20} className="text-accent-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{exerciseCount}</div>
                    <div className="text-sm text-text-secondary">Ejercicios</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{totalSets}</div>
                    <div className="text-sm text-text-secondary">Sets totales</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">~{routine.estimated_duration_minutes}</div>
                    <div className="text-sm text-text-secondary">Minutos</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{muscleGroups.length}</div>
                    <div className="text-sm text-text-secondary">Músculos</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Exercises List */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Ejercicios de la Rutina
              </h2>

              {exerciseCount === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-background-card rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell size={24} className="text-text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    No hay ejercicios en esta rutina
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Agrega ejercicios para completar tu rutina
                  </p>
                  <Button onClick={handleEdit} variant="outline">
                    <Edit size={16} className="mr-2" />
                    Editar Rutina
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {routine.exercises?.map((routineExercise, index) => (
                    <div
                      key={routineExercise.id}
                      className="flex items-center gap-4 p-4 bg-background-tertiary rounded-lg border border-border-primary"
                    >
                      {/* Order Number */}
                      <div className="w-8 h-8 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary font-semibold text-sm">
                        {index + 1}
                      </div>

                      {/* Exercise Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {routineExercise.exercise?.name || 'Ejercicio desconocido'}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {routineExercise.exercise?.muscle_group_primary || 'Músculo desconocido'}
                        </p>
                      </div>

                      {/* Configuration */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-white font-semibold">{routineExercise.sets || 3}</div>
                          <div className="text-text-tertiary text-xs">Sets</div>
                        </div>

                        <div className="text-center">
                          <div className="text-white font-semibold">{routineExercise.reps || 10}</div>
                          <div className="text-text-tertiary text-xs">Reps</div>
                        </div>

                        <div className="text-center">
                          <div className="text-white font-semibold">{routineExercise.rest_seconds || 60}s</div>
                          <div className="text-text-tertiary text-xs">Descanso</div>
                        </div>

                        {routineExercise.weight_suggestion_kg && (
                          <div className="text-center">
                            <div className="text-white font-semibold">{routineExercise.weight_suggestion_kg}kg</div>
                            <div className="text-text-tertiary text-xs">Peso sugerido</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Routine Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Información de la Rutina
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-tertiary">Dificultad</label>
                  <div className={cn(
                    "inline-flex px-3 py-1 rounded-full text-sm font-medium border mt-1",
                    difficulty.color
                  )}>
                    {difficulty.label}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-text-tertiary">Creada</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={16} className="text-text-secondary" />
                    <span className="text-text-primary">
                      {new Date(routine.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {routine.updated_at !== routine.created_at && (
                  <div>
                    <label className="text-sm text-text-tertiary">Última modificación</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Edit size={16} className="text-text-secondary" />
                      <span className="text-text-primary">
                        {new Date(routine.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {routine.tags && routine.tags.length > 0 && (
                  <div>
                    <label className="text-sm text-text-tertiary">Etiquetas</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {routine.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-background-card text-text-secondary text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Muscle Groups */}
            {muscleGroups.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Músculos Trabajados
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((muscle, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent-primary/20 text-accent-primary text-sm rounded-md border border-accent-primary/30"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Acciones
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleStartTraining}
                  className="w-full"
                >
                  <Play size={16} className="mr-2" />
                  Iniciar Entrenamiento
                </Button>
                
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="w-full"
                >
                  <Edit size={16} className="mr-2" />
                  Editar Rutina
                </Button>
                
                <Button
                  onClick={handleDuplicate}
                  variant="outline"
                  className="w-full"
                  disabled={actionLoading === 'duplicate'}
                >
                  {actionLoading === 'duplicate' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Copy size={16} className="mr-2" />
                  )}
                  Duplicar Rutina
                </Button>
                
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="w-full text-status-error hover:text-status-error hover:border-status-error"
                  disabled={actionLoading === 'delete'}
                >
                  {actionLoading === 'delete' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Trash2 size={16} className="mr-2" />
                  )}
                  Eliminar Rutina
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
