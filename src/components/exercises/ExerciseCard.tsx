'use client'

import { useState } from 'react'
import { Heart, Play, Plus, Dumbbell } from 'lucide-react'
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
}

export function ExerciseCard({ 
  exercise, 
  onToggleFavorite, 
  onViewDetails,
  onAddToRoutine,
  compact = false,
  showAddButton = true,
  isSelected = false
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

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <Card className="group hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden border-slate-700/50">
      {/* Imagen del ejercicio */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {exercise.image_url && !imageError ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Dumbbell size={32} />
          </div>
        )}
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleViewDetails}
            className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
          >
            <Play size={16} />
            Ver
          </Button>
          {onToggleFavorite && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggleFavorite(exercise.id)}
              className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
            >
              <Heart 
                size={16} 
                className={cn(
                  "transition-colors",
                  exercise.is_favorite && "fill-red-500 text-red-500"
                )}
              />
            </Button>
          )}
        </div>

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex gap-2">
          {difficulty && (
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
              getDifficultyColor(difficulty.id)
            )}>
              {difficulty.icon} {difficulty.name}
            </div>
          )}
        </div>

        {/* Badge de favorito */}
        {exercise.is_favorite && (
          <div className="absolute top-3 right-3">
            <Heart size={16} className="fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {exercise.name}
          </h3>
          
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {exercise.description || 'Sin descripción disponible'}
          </p>
        </div>

        {/* Tags de información */}
        <div className="flex items-center gap-2 flex-wrap">
          {muscleGroup && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              muscleGroup.color.replace('bg-', 'bg-') + '/20 border',
              muscleGroup.color.replace('bg-', 'border-') + '/30',
              muscleGroup.color.replace('bg-', 'text-')
            )}>
              <span>{muscleGroup.icon}</span>
              {muscleGroup.name}
            </span>
          )}
          
          {exercise.equipment && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50 capitalize">
              {exercise.equipment}
            </span>
          )}
          
          {muscleCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {muscleCount} músculos
            </span>
          )}
        </div>

        {/* Estadísticas del usuario */}
        {exercise.user_stats && (
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex justify-between items-center text-xs">
              <div className="text-slate-400">
                <span className="text-white font-medium">{exercise.user_stats.best_weight}kg</span> mejor marca
              </div>
              <div className="text-slate-400">
                <span className="text-white font-medium">{exercise.user_stats.total_sessions}</span> sesiones
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400"
            onClick={handleViewDetails}
          >
            Ver detalles
          </Button>
          {onAddToRoutine && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onAddToRoutine(exercise)}
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
