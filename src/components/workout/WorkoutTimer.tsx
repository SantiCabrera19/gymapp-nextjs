'use client'

import { Timer, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkoutTimerProps {
  timeElapsed: string
  isActive: boolean
  onToggle?: () => void
  className?: string
}

export function WorkoutTimer({ 
  timeElapsed, 
  isActive, 
  onToggle,
  className 
}: WorkoutTimerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 text-sm">
        <Timer className={cn(
          "h-4 w-4",
          isActive ? "text-accent-primary animate-pulse" : "text-text-tertiary"
        )} />
        <span className="font-mono text-text-primary">
          {timeElapsed}
        </span>
      </div>
      
      {onToggle && (
        <button
          onClick={onToggle}
          className="ml-auto rounded-full p-1 hover:bg-background-card transition-colors"
        >
          {isActive ? (
            <Pause className="h-3 w-3 text-text-secondary" />
          ) : (
            <Play className="h-3 w-3 text-text-secondary" />
          )}
        </button>
      )}
    </div>
  )
}
