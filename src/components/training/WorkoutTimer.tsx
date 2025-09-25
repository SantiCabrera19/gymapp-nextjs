'use client'

import { Clock, Pause, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatDuration } from '@/types/training'
import { cn } from '@/lib/utils'

interface WorkoutTimerProps {
  sessionSeconds: number
  restSeconds: number
  isSessionRunning: boolean
  isRestRunning: boolean
  onPauseSession: () => void
  onResumeSession: () => void
  onStopRest: () => void
  className?: string
}

export function WorkoutTimer({
  sessionSeconds,
  restSeconds,
  isSessionRunning,
  isRestRunning,
  onPauseSession,
  onResumeSession,
  onStopRest,
  className
}: WorkoutTimerProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50", className)}>
      {/* Timer de Sesión */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          <div className="text-sm text-slate-400">Sesión</div>
        </div>
        <div className="font-mono text-xl font-semibold text-white">
          {formatDuration(sessionSeconds)}
        </div>
        <Button
          size="sm"
          variant={isSessionRunning ? "secondary" : "default"}
          onClick={isSessionRunning ? onPauseSession : onResumeSession}
          className="ml-2"
        >
          {isSessionRunning ? <Pause size={16} /> : <Play size={16} />}
        </Button>
      </div>

      {/* Timer de Descanso */}
      {isRestRunning && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <div className="text-sm text-slate-400">Descanso</div>
          </div>
          <div className="font-mono text-xl font-semibold text-orange-400">
            {formatDuration(restSeconds)}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onStopRest}
            className="ml-2 border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
          >
            <Square size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
