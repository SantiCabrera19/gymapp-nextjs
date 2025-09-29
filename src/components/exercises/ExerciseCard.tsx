'use client'

import { useState } from 'react'
import { Dumbbell, Play, Check, Plus, Eye, Heart } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { Exercise, DIFFICULTY_LEVELS, MUSCLE_GROUPS } from '@/types/exercises'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
interface ExerciseCardProps {
  exercise: Exercise
  onToggleFavorite?: (id: string) => void
  onViewDetails?: (exercise: Exercise) => void
  onAddToRoutine?: (exercise: Exercise) => void
  compact?: boolean
  showAddButton?: boolean
  isSelected?: boolean
  showTooltip?: boolean
  disabled?: boolean
  className?: string
}

export function ExerciseCard({ 
  exercise, 
  onToggleFavorite, 
  onViewDetails,
  onAddToRoutine,
  compact = false,
  showAddButton = true,
  isSelected = false,
  showTooltip = false,
  disabled = false,
  className
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === exercise.difficulty_level)
  const muscleGroup = MUSCLE_GROUPS.find(m => m.id === exercise.muscle_group_primary)
  const muscleCount = exercise.muscles?.length || 0

  // Crear slug desde el nombre del ejercicio
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  const handleViewDetails = () => {
    const slug = createSlug(exercise.name)
    router.push(`/exercises/${slug}`)
  }

  const getDifficultyStyles = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      default: return 'Sin definir'
    }
  }

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails?.(exercise)
    } else {
      handleViewDetails()
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onToggleFavorite?.(exercise.id)
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500 ease-out",
        "cursor-pointer border-2 backdrop-blur-sm",
        // Base styles
        "bg-gradient-to-br from-background-card/80 to-background-tertiary/60",
        "border-border-primary/40 shadow-lg shadow-black/20",
        // Hover effects - PREMIUM
        "hover:shadow-2xl hover:shadow-accent-primary/20 hover:-translate-y-3 hover:scale-[1.02]",
        "hover:border-accent-primary/60 hover:from-accent-primary/10 hover:to-accent-primary/5",
        "hover:backdrop-blur-md",
        // Active state
        "active:scale-[0.98] active:translate-y-0 active:shadow-lg",
        // Focus state
        "focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background-primary",
        // Selected state
        isSelected && "border-accent-primary shadow-accent-primary/30 bg-accent-primary/5",
        // Disabled state
        disabled && "opacity-60 cursor-not-allowed hover:transform-none hover:shadow-lg",
        className
      )}
      role={!disabled ? "button" : undefined}
      tabIndex={!disabled ? 0 : -1}
      aria-pressed={isSelected}
      onClick={!disabled ? handleCardClick : undefined}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Image Container - PREMIUM */}
      <div className={cn(
        "relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-background-tertiary to-background-card",
        "border border-border-primary/20 shadow-inner",
        "group-hover:shadow-lg group-hover:border-accent-primary/30 transition-all duration-500",
        compact ? "aspect-[4/3]" : "aspect-video"
      )}>
        {exercise.image_url && !imageError ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 ease-out",
              "group-hover:scale-110 group-hover:brightness-110",
              isSelected && "scale-105 brightness-105",
              !disabled && "group-hover:saturate-110"
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn(
            "relative w-full h-full flex items-center justify-center",
            "bg-gradient-to-br from-background-tertiary via-background-card to-background-tertiary",
            "group-hover:from-accent-primary/20 group-hover:via-accent-primary/10 group-hover:to-accent-primary/20",
            "transition-all duration-500 ease-out"
          )}>
            <div className={cn(
              "p-4 rounded-full bg-background-primary/20 backdrop-blur-sm",
              "border border-border-primary/30 shadow-lg",
              "group-hover:bg-accent-primary/20 group-hover:border-accent-primary/50",
              "group-hover:scale-110 group-hover:shadow-xl",
              "transition-all duration-500 ease-out"
            )}>
              <Dumbbell 
                size={compact ? 28 : 40} 
                className={cn(
                  "transition-all duration-500 ease-out",
                  isSelected ? "text-accent-primary" : "text-text-tertiary",
                  !disabled && "group-hover:text-accent-primary group-hover:drop-shadow-lg"
                )}
              />
            </div>
          </div>
        )}
        
        {/* Difficulty Badge - PREMIUM */}
        <div className={cn(
          "absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold",
          "backdrop-blur-md border shadow-lg",
          "group-hover:scale-110 group-hover:shadow-xl group-hover:-translate-y-0.5",
          "transition-all duration-300 ease-out",
          getDifficultyStyles(exercise.difficulty_level || 'beginner')
        )}>
          {getDifficultyLabel(exercise.difficulty_level || 'beginner')}
        </div>
        
        {/* Selection Indicator Overlay - PREMIUM */}
        {isSelected && (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br from-accent-primary/30 to-accent-primary/10",
            "flex items-center justify-center backdrop-blur-sm",
            "animate-in fade-in-0 zoom-in-95 duration-500"
          )}>
            <div className={cn(
              "w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center",
              "shadow-2xl shadow-accent-primary/50 border-2 border-white/20",
              "animate-in zoom-in-50 duration-300 delay-100",
              "group-hover:scale-110 transition-transform duration-300"
            )}>
              <Play size={24} className="text-white ml-1 drop-shadow-lg" />
            </div>
          </div>
        )}
        
        {/* Favorite Button - PREMIUM */}
        {onToggleFavorite && (
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "absolute top-4 right-4 w-8 h-8 rounded-full",
              "bg-background-primary/80 backdrop-blur-md border border-border-primary/30",
              "flex items-center justify-center shadow-lg",
              "opacity-0 group-hover:opacity-100 transition-all duration-300",
              "hover:scale-110 hover:bg-accent-primary/20 hover:border-accent-primary/50",
              "active:scale-95"
            )}
          >
            <Heart size={14} className="text-text-secondary hover:text-accent-primary transition-colors" />
          </button>
        )}
      </div>

      {/* Content - PREMIUM */}
      <div className="space-y-4 p-1">
        <div className="space-y-3">
          <h3 className={cn(
            "font-bold line-clamp-2 leading-tight transition-all duration-300",
            compact ? "text-lg" : "text-xl",
            isSelected ? "text-accent-primary" : "text-white",
            !disabled && "group-hover:text-accent-primary group-hover:tracking-wide"
          )}>
            {exercise.name}
          </h3>
          
          {/* Muscle Group Tags - PREMIUM */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-background-primary/40 backdrop-blur-sm border border-border-primary/30",
              "group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30",
              "transition-all duration-300 ease-out"
            )}>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full shadow-sm",
                muscleGroup?.color || "bg-text-tertiary",
                "group-hover:shadow-md transition-shadow duration-300"
              )} />
              <span className={cn(
                "text-sm font-medium transition-all duration-300",
                isSelected ? "text-accent-primary" : "text-text-secondary",
                !disabled && "group-hover:text-accent-primary"
              )}>
                {muscleGroup?.name || 'General'}
              </span>
            </div>
            
            {muscleCount > 1 && (
              <div className={cn(
                "px-2 py-1 rounded-full bg-background-tertiary/60 border border-border-primary/20",
                "group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30",
                "transition-all duration-300"
              )}>
                <span className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  isSelected ? "text-accent-primary" : "text-text-tertiary",
                  !disabled && "group-hover:text-accent-primary"
                )}>
                  +{muscleCount - 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions - PREMIUM */}
        {!disabled && (
          <div className={cn(
            "flex gap-3 pt-4 border-t border-border-primary/20",
            "group-hover:border-accent-primary/30 transition-colors duration-300"
          )}>
            {showAddButton && onAddToRoutine && (
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToRoutine?.(exercise)
                }}
                className={cn(
                  "flex-1 h-10 font-semibold transition-all duration-300 ease-out",
                  "shadow-md hover:shadow-lg active:shadow-sm",
                  isSelected 
                    ? "bg-accent-primary text-white border-accent-primary hover:bg-accent-hover scale-[0.98]" 
                    : "hover:bg-accent-primary hover:text-white hover:border-accent-primary hover:scale-[1.02]"
                )}
              >
                {isSelected ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Agregado
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetails()
              }}
              className={cn(
                "h-10 px-4 font-medium transition-all duration-300 ease-out",
                "hover:bg-accent-primary/15 hover:text-accent-primary hover:scale-105",
                "active:scale-95 shadow-sm hover:shadow-md"
              )}
            >
              <Eye size={16} className="mr-2" />
              Ver
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
