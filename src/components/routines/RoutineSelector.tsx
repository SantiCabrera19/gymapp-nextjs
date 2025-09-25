'use client'

import { useState, useEffect } from 'react'
import { Search, Play, Plus, Clock, Target, Dumbbell } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { getUserRoutines, type Routine } from '@/lib/api/routines'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface RoutineSelectorProps {
  onSelectRoutine: (routine: Routine) => void
  onCreateRoutine: () => void
  selectedRoutineId?: string
  title?: string
  showCreateButton?: boolean
}

export function RoutineSelector({
  onSelectRoutine,
  onCreateRoutine,
  selectedRoutineId,
  title = "Seleccionar Rutina",
  showCreateButton = true
}: RoutineSelectorProps) {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Cargar rutinas del usuario
  useEffect(() => {
    if (!user?.id) {
      setRoutines([])
      setLoading(false)
      return
    }

    const loadRoutines = async () => {
      try {
        setLoading(true)
        setError(null)
        const userRoutines = await getUserRoutines(user.id)
        setRoutines(userRoutines)
      } catch (err) {
        console.error('Error loading routines:', err)
        setError(err instanceof Error ? err.message : 'Error loading routines')
        setRoutines([])
      } finally {
        setLoading(false)
      }
    }

    loadRoutines()
  }, [user?.id])

  // Filtrar rutinas por búsqueda
  const filteredRoutines = routines.filter(routine =>
    routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    routine.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-400/10'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced': return 'text-red-400 bg-red-400/10'
      default: return 'text-slate-400 bg-slate-400/10'
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      default: return level
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Error al cargar rutinas</div>
          <div className="text-sm text-slate-400 mb-4">{error}</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (routines.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <EmptyState
          icon={<Target size={48} />}
          title="No tienes rutinas creadas"
          description="Crea tu primera rutina para poder iniciar entrenamientos estructurados y hacer seguimiento de tu progreso."
          action={showCreateButton ? {
            label: "Crear Primera Rutina",
            onClick: onCreateRoutine
          } : undefined}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showCreateButton && (
          <Button variant="outline" size="sm" onClick={onCreateRoutine}>
            <Plus size={16} className="mr-2" />
            Nueva Rutina
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar rutinas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Routines List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredRoutines.length > 0 ? (
          filteredRoutines.map((routine) => {
            const isSelected = selectedRoutineId === routine.id
            const exerciseCount = routine.exercises?.length || 0
            
            return (
              <Card
                key={routine.id}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:bg-slate-800/80",
                  isSelected && "ring-2 ring-blue-500 bg-blue-500/10"
                )}
                onClick={() => onSelectRoutine(routine)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white truncate">
                        {routine.name}
                      </h4>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getDifficultyColor(routine.difficulty_level)
                      )}>
                        {getDifficultyLabel(routine.difficulty_level)}
                      </span>
                    </div>
                    
                    {routine.description && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                        {routine.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Dumbbell size={12} />
                        <span>{exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>~{routine.estimated_duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "ghost"}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRoutine(routine)
                      }}
                    >
                      <Play size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No se encontraron rutinas</div>
            <Button variant="ghost" onClick={() => setSearchQuery('')}>
              Limpiar búsqueda
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
