'use client'

import { SET_TYPES, SET_TYPE_CONFIG, type SetType } from '@/types/training'
import { cn } from '@/lib/utils'

interface SetTypeSelectorProps {
  value: SetType
  onChange: (type: SetType) => void
  className?: string
}

export function SetTypeSelector({ value, onChange, className }: SetTypeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {Object.values(SET_TYPES).map((type) => {
        const config = SET_TYPE_CONFIG[type]
        const isSelected = value === type
        
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
              "hover:scale-105 active:scale-95",
              isSelected
                ? `${config.color} ${config.borderColor} text-white shadow-lg`
                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              isSelected ? "bg-white/20" : "bg-slate-700/50"
            )}>
              {config.code}
            </div>
            <span className="text-xs font-medium">
              {config.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
