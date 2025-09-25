'use client'

import { useState } from 'react'
import { Edit2, Trash2, Trophy, Calendar } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { SET_TYPE_CONFIG, getSetDisplayNumber, formatDuration, type ExerciseSet, type SetFormData } from '@/types/training'
import { cn } from '@/lib/utils'

interface ExerciseSetsListProps {
  sets: ExerciseSet[]
  exerciseId: string
  onUpdateSet?: (setId: string, data: Partial<SetFormData>) => Promise<ExerciseSet>
  onDeleteSet?: (setId: string) => Promise<void>
  className?: string
}

export function ExerciseSetsList({
  sets,
  exerciseId,
  onUpdateSet,
  onDeleteSet,
  className
}: ExerciseSetsListProps) {
  const [editingSet, setEditingSet] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<SetFormData>>({})
  const [loading, setLoading] = useState<string | null>(null)

  // Filtrar sets del ejercicio actual
  const exerciseSets = sets.filter(set => set.exercise_id === exerciseId)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())

  if (exerciseSets.length === 0) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="text-slate-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay series registradas aún</p>
          <p className="text-sm mt-1">Completa tu primera serie para ver el historial</p>
        </div>
      </Card>
    )
  }

  const handleEdit = (set: ExerciseSet) => {
    setEditingSet(set.id)
    setEditData({
      weight_kg: set.weight_kg || 0,
      reps_completed: set.reps_completed,
      set_type: set.set_type,
      rpe_score: set.rpe_score,
      notes: set.notes
    })
  }

  const handleSaveEdit = async (setId: string) => {
    if (!onUpdateSet) return
    
    try {
      setLoading(setId)
      await onUpdateSet(setId, editData)
      setEditingSet(null)
      setEditData({})
    } catch (error) {
      console.error('Error updating set:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingSet(null)
    setEditData({})
  }

  const handleDelete = async (setId: string) => {
    if (!onDeleteSet) return
    
    const confirmed = window.confirm('¿Estás seguro de eliminar esta serie?')
    if (!confirmed) return
    
    try {
      setLoading(setId)
      await onDeleteSet(setId)
    } catch (error) {
      console.error('Error deleting set:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white">Series Completadas</h4>
          <span className="text-sm text-slate-400">{exerciseSets.length} series</span>
        </div>

        <div className="space-y-2">
          {exerciseSets.map((set, index) => {
            const config = SET_TYPE_CONFIG[set.set_type]
            const isEditing = editingSet === set.id
            const isLoading = loading === set.id
            const setNumber = getSetDisplayNumber(index + 1, set.set_type)
            
            return (
              <div
                key={set.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  `${config.borderColor} bg-slate-800/30`,
                  isEditing && "ring-2 ring-blue-500/50"
                )}
              >
                {/* Número/Tipo de serie */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  config.color
                )}>
                  {setNumber}
                </div>

                {/* Datos de la serie */}
                <div className="flex-1 grid grid-cols-3 gap-3 items-center">
                  {isEditing ? (
                    <>
                      {/* Peso editable */}
                      <input
                        type="number"
                        step="0.5"
                        value={editData.weight_kg || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, weight_kg: Number(e.target.value) }))}
                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white text-center"
                        placeholder="Peso"
                      />
                      {/* Reps editable */}
                      <input
                        type="number"
                        value={editData.reps_completed || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, reps_completed: Number(e.target.value) }))}
                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white text-center"
                        placeholder="Reps"
                      />
                      {/* RPE editable */}
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editData.rpe_score || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, rpe_score: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white text-center"
                        placeholder="RPE"
                      />
                    </>
                  ) : (
                    <>
                      {/* Peso */}
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          {set.weight_kg ? `${set.weight_kg}kg` : '-'}
                        </div>
                        <div className="text-xs text-slate-500">peso</div>
                      </div>
                      {/* Reps */}
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          {set.reps_completed} reps
                        </div>
                        <div className="text-xs text-slate-500">repeticiones</div>
                      </div>
                      {/* RPE */}
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          {set.rpe_score ? `RPE ${set.rpe_score}` : '-'}
                        </div>
                        <div className="text-xs text-slate-500">esfuerzo</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(set.id)}
                        disabled={isLoading}
                        className="h-8 px-2"
                      >
                        {isLoading ? '...' : '✓'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="h-8 px-2"
                      >
                        ✕
                      </Button>
                    </>
                  ) : (
                    <>
                      {onUpdateSet && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(set)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </Button>
                      )}
                      {onDeleteSet && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(set.id)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumen */}
        {exerciseSets.length > 0 && (
          <div className="pt-3 border-t border-slate-700/50">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-slate-400">Total Series</div>
                <div className="font-semibold text-white">{exerciseSets.length}</div>
              </div>
              <div>
                <div className="text-slate-400">Volumen</div>
                <div className="font-semibold text-white">
                  {exerciseSets.reduce((total, set) => total + ((set.weight_kg || 0) * set.reps_completed), 0).toFixed(0)}kg
                </div>
              </div>
              <div>
                <div className="text-slate-400">Mejor Serie</div>
                <div className="font-semibold text-white">
                  {Math.max(...exerciseSets.map(set => set.weight_kg || 0))}kg
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
