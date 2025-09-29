'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ExerciseTimerProps {
  isActive: boolean
  onTimeUpdate?: (seconds: number) => void
  className?: string
}

export function ExerciseTimer({ isActive, onTimeUpdate, className }: ExerciseTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Auto-start cuando la sesión está activa
  useEffect(() => {
    if (isActive && !isRunning) {
      handleStart()
    } else if (!isActive && isRunning) {
      handlePause()
    }
  }, [isActive])

  // Timer principal
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1
          onTimeUpdate?.(newSeconds)
          return newSeconds
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, onTimeUpdate])

  const handleStart = useCallback(() => {
    setIsRunning(true)
    if (!startTime) {
      setStartTime(Date.now())
    }
  }, [startTime])

  const handlePause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
    setStartTime(null)
  }, [])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (!isRunning) return 'text-text-secondary'
    if (seconds < 60) return 'text-green-400'
    if (seconds < 300) return 'text-yellow-400' 
    return 'text-red-400'
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background-card rounded-full flex items-center justify-center">
            <Clock size={20} className="text-accent-primary" />
          </div>
          <div>
            <div className="text-sm text-text-secondary">Tiempo de ejercicio</div>
            <div className={cn(
              "text-2xl font-mono font-bold transition-colors",
              getTimerColor()
            )}>
              {formatTime(seconds)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de estado */}
          <div className={cn(
            "w-3 h-3 rounded-full transition-all",
            isRunning 
              ? "bg-green-400 animate-pulse" 
              : "bg-text-tertiary"
          )} />

          {/* Controles */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={isRunning ? handlePause : handleStart}
              className="text-text-secondary hover:text-accent-primary"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleReset}
              className="text-text-secondary hover:text-status-warning"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-3 w-full bg-background-tertiary rounded-full h-1 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isRunning ? "bg-accent-primary" : "bg-text-tertiary"
          )}
          style={{
            width: isRunning ? `${Math.min((seconds % 60) * (100/60), 100)}%` : '0%'
          }}
        />
      </div>

      {/* Stats rápidas */}
      {seconds > 0 && (
        <div className="mt-2 flex justify-between text-xs text-text-tertiary">
          <span>
            {startTime && `Iniciado: ${new Date(startTime).toLocaleTimeString()}`}
          </span>
          <span>
            {Math.floor(seconds / 60)} min transcurridos
          </span>
        </div>
      )}
    </Card>
  )
}

// Hook para usar el timer en otros componentes
export function useExerciseTimer() {
  const [currentExerciseTime, setCurrentExerciseTime] = useState(0)
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0)

  const handleExerciseTimeUpdate = useCallback((seconds: number) => {
    setCurrentExerciseTime(seconds)
  }, [])

  const resetExerciseTimer = useCallback(() => {
    setCurrentExerciseTime(0)
  }, [])

  const addToTotalTime = useCallback((exerciseSeconds: number) => {
    setTotalWorkoutTime(prev => prev + exerciseSeconds)
  }, [])

  return {
    currentExerciseTime,
    totalWorkoutTime,
    handleExerciseTimeUpdate,
    resetExerciseTimer,
    addToTotalTime
  }
}
