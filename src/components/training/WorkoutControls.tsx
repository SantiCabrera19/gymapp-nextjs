'use client'

import { useState } from 'react'
import { Play, Pause, Square, CheckCircle, X, MoreHorizontal } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { WORKOUT_STATUS, type WorkoutStatus } from '@/types/training'
import { cn } from '@/lib/utils'

interface WorkoutControlsProps {
  status: WorkoutStatus
  onPause: () => Promise<void>
  onResume: () => Promise<void>
  onComplete: () => Promise<void>
  onCancel: () => Promise<void>
  loading?: boolean
  className?: string
}

export function WorkoutControls({
  status,
  onPause,
  onResume,
  onComplete,
  onCancel,
  loading = false,
  className,
}: WorkoutControlsProps) {
  const [showConfirm, setShowConfirm] = useState<'complete' | 'cancel' | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const isActive = status === WORKOUT_STATUS.ACTIVE
  const isPaused = status === WORKOUT_STATUS.PAUSED

  const handleAction = async (action: string, callback: () => Promise<void>) => {
    try {
      setActionLoading(action)
      await callback()
      setShowConfirm(null)
    } catch (error) {
      console.error(`Error in ${action}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = () => {
    if (showConfirm === 'complete') {
      handleAction('complete', onComplete)
    } else {
      setShowConfirm('complete')
    }
  }

  const handleCancel = () => {
    if (showConfirm === 'cancel') {
      handleAction('cancel', onCancel)
    } else {
      setShowConfirm('cancel')
    }
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Controles principales */}
        <div className="flex gap-3">
          {/* Pausa/Reanudar */}
          {isActive ? (
            <Button
              variant="secondary"
              onClick={() => handleAction('pause', onPause)}
              disabled={loading || !!actionLoading}
              className="flex-1"
            >
              {actionLoading === 'pause' ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Pause size={16} className="mr-2" />
              )}
              Pausar
            </Button>
          ) : isPaused ? (
            <Button
              onClick={() => handleAction('resume', onResume)}
              disabled={loading || !!actionLoading}
              className="flex-1"
            >
              {actionLoading === 'resume' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Play size={16} className="mr-2" />
              )}
              Reanudar
            </Button>
          ) : null}

          {/* Completar */}
          <Button
            onClick={handleComplete}
            disabled={loading || !!actionLoading}
            className={cn(
              'flex-1 transition-all',
              showConfirm === 'complete'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            )}
          >
            {actionLoading === 'complete' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <CheckCircle size={16} className="mr-2" />
            )}
            {showConfirm === 'complete' ? 'Confirmar' : 'Completar'}
          </Button>

          {/* Cancelar */}
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading || !!actionLoading}
            className={cn(
              'flex-1 transition-all',
              showConfirm === 'cancel'
                ? 'border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500/50'
            )}
          >
            {actionLoading === 'cancel' ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <X size={16} className="mr-2" />
            )}
            {showConfirm === 'cancel' ? 'Confirmar' : 'Cancelar'}
          </Button>
        </div>

        {/* Mensajes de confirmación */}
        {showConfirm && (
          <div
            className={cn(
              'p-3 rounded-lg border text-sm',
              showConfirm === 'complete'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
            <div className="flex items-center justify-between">
              <span>
                {showConfirm === 'complete'
                  ? '¿Completar entrenamiento? Se guardará automáticamente.'
                  : '¿Cancelar entrenamiento? Se perderán todos los datos.'}
              </span>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-slate-400 hover:text-white ml-2"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Estado actual */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isActive ? 'bg-green-400 animate-pulse' : isPaused ? 'bg-yellow-400' : 'bg-slate-500'
            )}
          />
          <span>
            {isActive
              ? 'Entrenamiento activo'
              : isPaused
                ? 'Entrenamiento pausado'
                : 'Estado desconocido'}
          </span>
        </div>
      </div>
    </Card>
  )
}
