'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Calendar } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { SetTypeSelector } from './SetTypeSelector'
import { useExerciseHistory } from '@/hooks/useTraining'
import { SET_TYPES, type SetFormData, type SetType } from '@/types/training'
import { cn } from '@/lib/utils'

interface SetInputFormProps {
  exerciseId: string
  exerciseName: string
  onSubmit: (data: SetFormData) => Promise<void>
  onStartRest: () => void
  loading?: boolean
  className?: string
}

export function SetInputForm({
  exerciseId,
  exerciseName,
  onSubmit,
  onStartRest,
  loading = false,
  className,
}: SetInputFormProps) {
  const { lastPerformance, bestPerformance, hasHistory } = useExerciseHistory(exerciseId)

  const [formData, setFormData] = useState<SetFormData>({
    weight_kg: '',
    reps_completed: '',
    set_type: SET_TYPES.NORMAL,
    rpe_score: undefined,
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-llenar con último peso si existe
  useEffect(() => {
    if (lastPerformance?.weight && formData.weight_kg === '') {
      setFormData(prev => ({ ...prev, weight_kg: lastPerformance.weight! }))
    }
  }, [lastPerformance, formData.weight_kg])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.weight_kg || formData.weight_kg <= 0) {
      newErrors.weight_kg = 'El peso debe ser mayor a 0'
    }

    if (!formData.reps_completed || formData.reps_completed <= 0) {
      newErrors.reps_completed = 'Las repeticiones deben ser mayor a 0'
    }

    if (formData.rpe_score && (formData.rpe_score < 1 || formData.rpe_score > 10)) {
      newErrors.rpe_score = 'RPE debe estar entre 1 y 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit({
        ...formData,
        weight_kg: Number(formData.weight_kg),
        reps_completed: Number(formData.reps_completed),
      })

      // Limpiar solo reps y notas, mantener peso y tipo
      setFormData(prev => ({
        ...prev,
        reps_completed: '',
        notes: '',
        rpe_score: undefined,
      }))

      // Iniciar timer de descanso automáticamente
      onStartRest()
    } catch (error) {
      console.error('Error adding set:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e as any)
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header con ejercicio */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">{exerciseName}</h3>
          {hasHistory && (
            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
              {lastPerformance && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    Último: {lastPerformance.weight}kg × {lastPerformance.reps}
                  </span>
                </div>
              )}
              {bestPerformance && (
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>
                    Mejor: {bestPerformance.weight}kg × {bestPerformance.reps}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs principales */}
          <div className="grid grid-cols-2 gap-4">
            {/* Peso */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Peso (kg)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.weight_kg}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    weight_kg: e.target.value ? Number(e.target.value) : '',
                  }))
                }
                onKeyPress={handleKeyPress}
                className={cn(
                  'w-full h-14 px-4 text-xl font-semibold text-center rounded-lg',
                  'bg-slate-800 border-2 text-white placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200',
                  errors.weight_kg ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
                )}
                placeholder="0"
                disabled={loading}
              />
              {errors.weight_kg && <p className="text-xs text-red-400">{errors.weight_kg}</p>}
            </div>

            {/* Repeticiones */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Repeticiones</label>
              <input
                type="number"
                min="1"
                value={formData.reps_completed}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    reps_completed: e.target.value ? Number(e.target.value) : '',
                  }))
                }
                onKeyPress={handleKeyPress}
                className={cn(
                  'w-full h-14 px-4 text-xl font-semibold text-center rounded-lg',
                  'bg-slate-800 border-2 text-white placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200',
                  errors.reps_completed
                    ? 'border-red-500'
                    : 'border-slate-700 hover:border-slate-600'
                )}
                placeholder="0"
                disabled={loading}
              />
              {errors.reps_completed && (
                <p className="text-xs text-red-400">{errors.reps_completed}</p>
              )}
            </div>
          </div>

          {/* Tipo de serie */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Tipo de Serie</label>
            <SetTypeSelector
              value={formData.set_type}
              onChange={type => setFormData(prev => ({ ...prev, set_type: type }))}
            />
          </div>

          {/* RPE (opcional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">RPE (1-10) - Opcional</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.rpe_score || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  rpe_score: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className={cn(
                'w-full h-12 px-4 text-lg text-center rounded-lg',
                'bg-slate-800 border-2 text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'transition-all duration-200',
                errors.rpe_score ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
              )}
              placeholder="Esfuerzo percibido"
              disabled={loading}
            />
            {errors.rpe_score && <p className="text-xs text-red-400">{errors.rpe_score}</p>}
          </div>

          {/* Notas (opcional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Notas - Opcional</label>
            <textarea
              value={formData.notes || ''}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className={cn(
                'w-full px-4 py-3 rounded-lg resize-none',
                'bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'hover:border-slate-600 transition-all duration-200'
              )}
              placeholder="Observaciones sobre la serie..."
              disabled={loading}
            />
          </div>

          {/* Botón submit */}
          <Button
            type="submit"
            size="lg"
            disabled={loading || !formData.weight_kg || !formData.reps_completed}
            className="w-full h-14 text-lg font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus size={20} />
                Agregar Serie
              </div>
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
