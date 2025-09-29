'use client'

import { useState } from 'react'
import { Calendar, Clock, Dumbbell, Play, Edit, Copy, Trash2, MoreVertical } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { type Routine } from '@/lib/api/routines'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface RoutineCardProps {
  routine: Routine
  onStart?: (routine: Routine) => void
  onEdit?: (routine: Routine) => void
  onDuplicate?: (routine: Routine) => void
  onDelete?: (routine: Routine) => void
  compact?: boolean
}

export function RoutineCard({
  routine,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  compact = false,
}: RoutineCardProps) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)

  const exerciseCount = routine.exercises?.length || 0
  const difficultyConfig = {
    beginner: {
      label: 'Principiante',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    intermediate: {
      label: 'Intermedio',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    advanced: { label: 'Avanzado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  }

  const difficulty = difficultyConfig[routine.difficulty_level] || difficultyConfig.beginner

  const handleCardClick = () => {
    router.push(`/routines/${routine.id}`)
  }

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStart) {
      onStart(routine)
    } else {
      // Redirigir a training con rutina seleccionada
      router.push(`/training?routine=${routine.id}`)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(routine)
    } else {
      router.push(`/routines/${routine.id}/edit`)
    }
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate?.(routine)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(routine)
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        'border-border-primary hover:border-accent-primary/50',
        compact ? 'p-4' : 'p-6'
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold text-white truncate', compact ? 'text-lg' : 'text-xl')}>
            {routine.name}
          </h3>

          {routine.description && (
            <p
              className={cn(
                'text-text-secondary mt-1',
                compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'
              )}
            >
              {routine.description}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={e => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} />
          </Button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background-tertiary border border-border-primary rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-background-card transition-colors"
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-background-card transition-colors"
                >
                  <Copy size={14} />
                  Duplicar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-status-error hover:bg-status-error/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('px-2 py-1 rounded-full text-xs font-medium border', difficulty.color)}>
          {difficulty.label}
        </div>

        <div className="flex items-center gap-1 text-text-secondary text-sm">
          <Dumbbell size={14} />
          <span>
            {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 text-text-secondary text-sm">
          <Clock size={14} />
          <span>~{routine.estimated_duration_minutes} min</span>
        </div>
      </div>

      {/* Tags */}
      {routine.tags && routine.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {routine.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-background-card text-text-secondary text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {routine.tags.length > 3 && (
            <span className="px-2 py-1 bg-background-card text-text-secondary text-xs rounded-md">
              +{routine.tags.length - 3} más
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border-primary">
        <Button
          variant="outline"
          size="sm"
          onClick={handleStart}
          className="flex-1 hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-all"
        >
          <Play size={14} className="mr-2" />
          Entrenar
        </Button>

        <Button variant="ghost" size="sm" onClick={handleEdit} className="hover:bg-background-card">
          <Edit size={14} />
        </Button>
      </div>

      {/* Created date */}
      <div className="mt-3 pt-3 border-t border-border-primary/50">
        <div className="flex items-center gap-1 text-text-tertiary text-xs">
          <Calendar size={12} />
          <span>Creada {new Date(routine.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  )
}

// Click outside handler para cerrar menú de acciones
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useState(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  })
}
