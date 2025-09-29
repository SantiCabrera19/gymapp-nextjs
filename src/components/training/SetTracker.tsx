'use client'

import { useState, useCallback } from 'react'
import { Plus, Minus, Check, X, Timer, Target } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Set {
  id: string
  setNumber: number
  reps: number
  weight?: number
  restTime?: number
  completed: boolean
  notes?: string
}

interface SetTrackerProps {
  exerciseName: string
  onSetComplete?: (set: Set) => void
  onAllSetsComplete?: (sets: Set[]) => void
  className?: string
}

export function SetTracker({ 
  exerciseName, 
  onSetComplete, 
  onAllSetsComplete,
  className 
}: SetTrackerProps) {
  const [sets, setSets] = useState<Set[]>([
    { id: '1', setNumber: 1, reps: 0, completed: false }
  ])
  const [currentSet, setCurrentSet] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  const addSet = useCallback(() => {
    const newSet: Set = {
      id: Date.now().toString(),
      setNumber: sets.length + 1,
      reps: sets[sets.length - 1]?.reps || 0,
      weight: sets[sets.length - 1]?.weight,
      completed: false
    }
    setSets(prev => [...prev, newSet])
  }, [sets])

  const removeSet = useCallback((setId: string) => {
    if (sets.length <= 1) return
    setSets(prev => prev.filter(set => set.id !== setId))
  }, [sets])

  const updateSet = useCallback((setId: string, updates: Partial<Set>) => {
    setSets(prev => prev.map(set => 
      set.id === setId ? { ...set, ...updates } : set
    ))
  }, [])

  const completeSet = useCallback((setId: string) => {
    const set = sets.find(s => s.id === setId)
    if (!set) return

    const completedSet = { ...set, completed: true }
    updateSet(setId, { completed: true })
    onSetComplete?.(completedSet)

    // Avanzar al siguiente set
    const nextSetIndex = sets.findIndex(s => s.id === setId) + 1
    if (nextSetIndex < sets.length) {
      setCurrentSet(nextSetIndex)
      // Iniciar descanso automático
      setIsResting(true)
      setRestTimer(90) // 90 segundos por defecto
    } else {
      // Todos los sets completados
      onAllSetsComplete?.(sets.map(s => s.id === setId ? completedSet : s))
    }
  }, [sets, onSetComplete, onAllSetsComplete, updateSet])

  const skipRest = useCallback(() => {
    setIsResting(false)
    setRestTimer(0)
  }, [])

  const formatRestTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{exerciseName}</h3>
          <p className="text-sm text-text-secondary">
            Serie {currentSet + 1} de {sets.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addSet}
            className="text-green-400 border-green-400/30 hover:bg-green-400/10"
          >
            <Plus size={16} className="mr-1" />
            Serie
          </Button>
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Timer size={20} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-yellow-400 font-medium">Descanso</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">
                  {formatRestTime(restTimer)}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={skipRest}
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
            >
              Saltar
            </Button>
          </div>
        </Card>
      )}

      {/* Sets List */}
      <div className="space-y-3">
        {sets.map((set, index) => (
          <Card
            key={set.id}
            className={cn(
              "p-4 transition-all",
              set.completed && "bg-green-500/10 border-green-500/20",
              index === currentSet && !set.completed && "ring-2 ring-accent-primary border-accent-primary",
              index > currentSet && "opacity-60"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Set Number */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                set.completed 
                  ? "bg-green-500 text-white" 
                  : index === currentSet
                    ? "bg-accent-primary text-white"
                    : "bg-background-tertiary text-text-secondary"
              )}>
                {set.completed ? <Check size={16} /> : set.setNumber}
              </div>

              {/* Reps Input */}
              <div className="flex-1">
                <label className="text-xs text-text-secondary block mb-1">
                  Repeticiones
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => updateSet(set.id, { reps: Math.max(0, set.reps - 1) })}
                    disabled={set.completed}
                    className="text-text-secondary hover:text-accent-primary"
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(set.id, { reps: parseInt(e.target.value) || 0 })}
                    disabled={set.completed}
                    className="w-16 text-center bg-background-tertiary border-border-primary"
                    min="0"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => updateSet(set.id, { reps: set.reps + 1 })}
                    disabled={set.completed}
                    className="text-text-secondary hover:text-accent-primary"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Weight Input (Optional) */}
              <div className="flex-1">
                <label className="text-xs text-text-secondary block mb-1">
                  Peso (kg)
                </label>
                <Input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => updateSet(set.id, { weight: parseFloat(e.target.value) || undefined })}
                  disabled={set.completed}
                  placeholder="0"
                  className="bg-background-tertiary border-border-primary"
                  step="0.5"
                  min="0"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!set.completed ? (
                  <>
                    <Button
                      onClick={() => completeSet(set.id)}
                      disabled={set.reps === 0 || index !== currentSet}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <Check size={16} className="mr-1" />
                      Completar
                    </Button>
                    {sets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeSet(set.id)}
                        className="text-text-secondary hover:text-status-error"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-green-400 text-sm font-medium">
                    ✓ Completado
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {index === currentSet && !set.completed && (
              <div className="mt-3 pt-3 border-t border-border-primary">
                <Input
                  placeholder="Notas de la serie (opcional)..."
                  value={set.notes || ''}
                  onChange={(e) => updateSet(set.id, { notes: e.target.value })}
                  className="bg-background-tertiary border-border-primary text-sm"
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-text-secondary">
            <Target size={16} />
            <span>Total: {sets.filter(s => s.completed).length}/{sets.length} series</span>
          </div>
          <div className="text-text-secondary">
            Reps: {sets.reduce((acc, s) => acc + (s.completed ? s.reps : 0), 0)}
          </div>
        </div>
        
        {sets.every(s => s.completed) && (
          <div className="text-green-400 text-sm font-medium">
            🎉 ¡Ejercicio completado!
          </div>
        )}
      </div>
    </Card>
  )
}
