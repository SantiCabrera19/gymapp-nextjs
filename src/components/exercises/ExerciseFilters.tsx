'use client'

import { Filter, X, Heart, Target } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { type ExerciseFilters, MUSCLE_GROUPS, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from '@/types/exercises'
import { cn } from '@/lib/utils'

interface ExerciseFiltersProps {
  filters: ExerciseFilters
  onUpdateFilter: (key: keyof ExerciseFilters, value: any) => void
  onReset: () => void
  isOpen: boolean
  onToggle: () => void
}

export function ExerciseFilters({ 
  filters, 
  onUpdateFilter, 
  onReset, 
  isOpen, 
  onToggle 
}: ExerciseFiltersProps) {
  const activeFiltersCount = [
    filters.muscleGroups.length,
    filters.equipment.length,
    filters.difficulty.length,
    filters.isFavorite ? 1 : 0,
    filters.recommendedOnly ? 1 : 0
  ].reduce((sum, count) => sum + count, 0)

  const toggleArrayFilter = (key: 'muscleGroups' | 'equipment' | 'difficulty', value: string) => {
    const current = filters[key]
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    onUpdateFilter(key, updated)
  }

  return (
    <div className="relative">
      {/* Botón de filtros */}
      <Button
        variant="outline"
        onClick={onToggle}
        className={cn(
          "relative",
          activeFiltersCount > 0 && "border-blue-500 text-blue-400"
        )}
      >
        <Filter size={16} />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Panel de filtros mejorado */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onToggle}
          />
          
          {/* Panel de filtros */}
          <div className="absolute top-12 right-0 w-96 z-50">
            <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/50">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Filtros</h3>
                    <p className="text-sm text-slate-400">Refina tus resultados</p>
                  </div>
                  <div className="flex gap-2">
                    {activeFiltersCount > 0 && (
                      <Button size="sm" variant="outline" onClick={onReset} className="text-xs">
                        Limpiar todo
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={onToggle} className="hover:bg-slate-800">
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                {/* Filtros rápidos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Target size={16} className="text-blue-400" />
                    Acceso rápido
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="sm"
                      variant={filters.recommendedOnly ? "default" : "outline"}
                      onClick={() => onUpdateFilter('recommendedOnly', !filters.recommendedOnly)}
                      className="justify-start h-10"
                    >
                      <Target size={14} />
                      Recomendados
                    </Button>
                    <Button
                      size="sm"
                      variant={filters.isFavorite ? "default" : "outline"}
                      onClick={() => onUpdateFilter('isFavorite', !filters.isFavorite)}
                      className="justify-start h-10"
                    >
                      <Heart size={14} />
                      Favoritos
                    </Button>
                  </div>
                </div>

                {/* Grupos musculares */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span className="text-orange-400">💪</span>
                    Grupos musculares
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSCLE_GROUPS.map(group => (
                      <Button
                        key={group.id}
                        size="sm"
                        variant={filters.muscleGroups.includes(group.id) ? "default" : "outline"}
                        onClick={() => toggleArrayFilter('muscleGroups', group.id)}
                        className="justify-start h-10 text-xs"
                      >
                        <span className="mr-2">{group.icon}</span>
                        {group.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Equipamiento */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span className="text-green-400">🏋️</span>
                    Equipamiento
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT_TYPES.map(equipment => (
                      <Button
                        key={equipment}
                        size="sm"
                        variant={filters.equipment.includes(equipment) ? "default" : "outline"}
                        onClick={() => toggleArrayFilter('equipment', equipment)}
                        className="justify-start capitalize h-10 text-xs"
                      >
                        {equipment}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dificultad */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    Nivel de dificultad
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {DIFFICULTY_LEVELS.map(level => (
                      <Button
                        key={level.id}
                        size="sm"
                        variant={filters.difficulty.includes(level.id) ? "default" : "outline"}
                        onClick={() => toggleArrayFilter('difficulty', level.id)}
                        className="justify-start h-10"
                      >
                        <span className="mr-2">{level.icon}</span>
                        {level.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
