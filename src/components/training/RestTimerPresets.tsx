'use client'

import { Clock, Settings } from 'lucide-react'
import { Button } from '@/components/ui'
import { REST_TIMER_PRESETS, type RestTimerPreset, formatDuration } from '@/types/training'
import { cn } from '@/lib/utils'

interface RestTimerPresetsProps {
  selectedPreset: RestTimerPreset
  onSelectPreset: (preset: RestTimerPreset) => void
  onStartTimer: (seconds?: number) => void
  isTimerRunning: boolean
  className?: string
}

export function RestTimerPresets({
  selectedPreset,
  onSelectPreset,
  onStartTimer,
  isTimerRunning,
  className
}: RestTimerPresetsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-orange-400" />
        <h4 className="font-medium text-white">Tiempo de Descanso</h4>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-3 gap-2">
        {REST_TIMER_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset
          const minutes = Math.floor(preset / 60)
          const seconds = preset % 60
          const label = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${preset}s`
          
          return (
            <button
              key={preset}
              onClick={() => onSelectPreset(preset)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              )}
            >
              <div className={cn(
                "text-lg font-bold",
                isSelected ? "text-white" : "text-slate-300"
              )}>
                {label}
              </div>
              <div className="text-xs opacity-75">
                {preset < 60 ? 'segundos' : 'minutos'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Botón de inicio rápido */}
      <div className="flex gap-2">
        <Button
          onClick={() => onStartTimer()}
          disabled={isTimerRunning}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Clock size={16} className="mr-2" />
          Iniciar {formatDuration(selectedPreset)}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="px-3 border-slate-600 text-slate-400 hover:text-white"
          title="Configuración personalizada"
        >
          <Settings size={16} />
        </Button>
      </div>

      {/* Presets rápidos adicionales */}
      <div className="flex gap-2 pt-2 border-t border-slate-700/50">
        <span className="text-xs text-slate-500 flex-shrink-0 self-center">Rápido:</span>
        {[30, 60, 90].map((seconds) => (
          <button
            key={seconds}
            onClick={() => onStartTimer(seconds)}
            disabled={isTimerRunning}
            className={cn(
              "flex-1 py-2 px-3 text-xs rounded-md transition-all",
              "bg-slate-800/50 border border-slate-700/50 text-slate-400",
              "hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              !isTimerRunning && "active:scale-95"
            )}
          >
            {seconds}s
          </button>
        ))}
      </div>
    </div>
  )
}
