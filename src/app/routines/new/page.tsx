'use client'

import { useState } from 'react'
import { ArrowLeft, Save, Plus, X, GripVertical } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, Input } from '@/components/ui'
import { Breadcrumbs } from '@/components/ui'
import { ExerciseSelector } from '@/components/exercises/ExerciseSelector'
import { useRoutineBuilder } from '@/hooks/useRoutineBuilder'
import { useAuth, useAuthAction } from '@/hooks'
import { createRoutine } from '@/lib/api/routines'
import { type Exercise } from '@/types/exercises'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function NewRoutinePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { requireAuth } = useAuthAction()

  const {
    routine,
    isModified,
    updateRoutineInfo,
    addExercise,
    removeExercise,
    reorderExercises,
    updateExerciseConfig,
    addMultipleExercises,
    calculateEstimatedDuration,
    validateRoutine,
    resetRoutine,
  } = useRoutineBuilder()

  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    requireAuth(() => router.push('/routines/new'))
    return null
  }

  const handleSave = async () => {
    if (!user) return

    const validation = validateRoutine()
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      setSaving(true)
      setErrors([])

      const newRoutine = await createRoutine(user.id, routine)
      router.push(`/routines/${newRoutine.id}`)
    } catch (error) {
      console.error('Error creating routine:', error)
      setErrors(['Error al crear la rutina. Inténtalo de nuevo.'])
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isModified && !confirm('¿Estás seguro? Se perderán todos los cambios.')) {
      return
    }
    router.push('/routines')
  }

  const handleExerciseToggle = (exercise: Exercise) => {
    const isSelected = routine.exercises.some(ex => ex.id === exercise.id)
    if (isSelected) {
      removeExercise(exercise.id)
    } else {
      addExercise(exercise)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex !== dropIndex) {
      reorderExercises(dragIndex, dropIndex)
    }
  }

  // Calcular duración estimada automáticamente
  const estimatedDuration = calculateEstimatedDuration()

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Rutinas', href: '/routines' },
            { label: 'Nueva Rutina', href: '/routines/new', current: true },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Nueva Rutina</h1>
              <p className="text-text-secondary">
                Crea una rutina personalizada para tus entrenamientos
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !routine.name.trim()}
              className="min-w-[120px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <Card className="p-4 border-status-error/30 bg-status-error/5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-status-error">
                Corrige los siguientes errores:
              </h3>
              <ul className="text-sm text-text-secondary space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-status-error">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Información Básica</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Nombre de la rutina *
                  </label>
                  <Input
                    placeholder="Ej: Push Pull Legs, Full Body, etc."
                    value={routine.name}
                    onChange={e => updateRoutineInfo({ name: e.target.value })}
                    className={cn(errors.some(e => e.includes('nombre')) && 'border-status-error')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Describe el objetivo y características de esta rutina..."
                    value={routine.description}
                    onChange={e => updateRoutineInfo({ description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-primary rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Nivel de dificultad
                    </label>
                    <select
                      value={routine.difficulty_level}
                      onChange={e =>
                        updateRoutineInfo({
                          difficulty_level: e.target.value as
                            | 'beginner'
                            | 'intermediate'
                            | 'advanced',
                        })
                      }
                      className="w-full px-3 py-2 bg-background-tertiary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Duración estimada (min)
                    </label>
                    <Input
                      type="number"
                      min="15"
                      max="180"
                      value={routine.estimated_duration_minutes}
                      onChange={e =>
                        updateRoutineInfo({
                          estimated_duration_minutes: parseInt(e.target.value) || 60,
                        })
                      }
                    />
                    {estimatedDuration !== routine.estimated_duration_minutes && (
                      <p className="text-xs text-text-tertiary mt-1">
                        Sugerido: {estimatedDuration} min (basado en ejercicios)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Exercises */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Ejercicios ({routine.exercises.length})
                </h2>
                <Button onClick={() => setShowExerciseSelector(true)} size="sm">
                  <Plus size={16} className="mr-2" />
                  Agregar Ejercicios
                </Button>
              </div>

              {routine.exercises.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-background-card rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={24} className="text-text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    No hay ejercicios agregados
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Agrega ejercicios para completar tu rutina
                  </p>
                  <Button onClick={() => setShowExerciseSelector(true)} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Agregar Primer Ejercicio
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {routine.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      draggable
                      onDragStart={e => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, index)}
                      className="flex items-center gap-4 p-4 bg-background-tertiary rounded-lg border border-border-primary hover:border-border-secondary transition-colors group"
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-text-tertiary group-hover:text-text-secondary">
                        <GripVertical size={16} />
                      </div>

                      {/* Exercise Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{exercise.name}</h4>
                        <p className="text-sm text-text-secondary">
                          {exercise.muscle_group_primary}
                        </p>
                      </div>

                      {/* Configuration */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-text-tertiary">Sets:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={exercise.sets || 3}
                            onChange={e =>
                              updateExerciseConfig(exercise.id, {
                                sets: parseInt(e.target.value) || 3,
                              })
                            }
                            className="w-12 px-1 py-1 bg-background-card border border-border-primary rounded text-center text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-text-tertiary">Reps:</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={exercise.reps || 10}
                            onChange={e =>
                              updateExerciseConfig(exercise.id, {
                                reps: parseInt(e.target.value) || 10,
                              })
                            }
                            className="w-12 px-1 py-1 bg-background-card border border-border-primary rounded text-center text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-text-tertiary">Descanso:</span>
                          <input
                            type="number"
                            min="30"
                            max="300"
                            step="15"
                            value={exercise.rest_seconds || 60}
                            onChange={e =>
                              updateExerciseConfig(exercise.id, {
                                rest_seconds: parseInt(e.target.value) || 60,
                              })
                            }
                            className="w-16 px-1 py-1 bg-background-card border border-border-primary rounded text-center text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                          />
                          <span className="text-text-tertiary text-xs">s</span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeExercise(exercise.id)}
                        className="text-text-tertiary hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Ejercicios:</span>
                  <span className="text-white">{routine.exercises.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Sets totales:</span>
                  <span className="text-white">
                    {routine.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Duración:</span>
                  <span className="text-white">~{routine.estimated_duration_minutes} min</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Dificultad:</span>
                  <span
                    className={cn(
                      'capitalize',
                      routine.difficulty_level === 'beginner' && 'text-green-400',
                      routine.difficulty_level === 'intermediate' && 'text-yellow-400',
                      routine.difficulty_level === 'advanced' && 'text-red-400'
                    )}
                  >
                    {routine.difficulty_level === 'beginner' && 'Principiante'}
                    {routine.difficulty_level === 'intermediate' && 'Intermedio'}
                    {routine.difficulty_level === 'advanced' && 'Avanzado'}
                  </span>
                </div>
              </div>

              {routine.exercises.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-primary">
                  <h4 className="text-sm font-medium text-white mb-2">Músculos trabajados:</h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(routine.exercises.map(ex => ex.muscle_group_primary))).map(
                      muscle => (
                        <span
                          key={muscle}
                          className="px-2 py-1 bg-background-card text-text-secondary text-xs rounded-md"
                        >
                          {muscle}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Consejos</h3>

              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>Incluye ejercicios para diferentes grupos musculares</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>Ajusta los tiempos de descanso según la intensidad</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>Puedes reordenar ejercicios arrastrándolos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>La duración se calcula automáticamente</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
            <div className="w-full max-w-6xl max-h-[90vh] animate-in zoom-in-95 duration-300">
              <ExerciseSelector
                selectedExercises={routine.exercises}
                onExerciseToggle={handleExerciseToggle}
                onClose={() => setShowExerciseSelector(false)}
                title="Agregar Ejercicios a la Rutina"
                showPreview={true}
                onClearSelection={() => {
                  routine.exercises.forEach(exercise => handleExerciseToggle(exercise))
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
