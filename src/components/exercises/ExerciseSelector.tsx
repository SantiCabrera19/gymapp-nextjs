'use client'

import { useState, useEffect } from 'react'
import { Search, Check, Plus, X } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseFilters } from './ExerciseFilters'
import { useExercises } from '@/hooks/useExercises'
import { Exercise } from '@/types/exercises'
import { cn } from '@/lib/utils'

interface ExerciseSelectorProps {
  selectedExercises: Exercise[]
  onExerciseToggle: (exercise: Exercise) => void
  onClose?: () => void
  maxSelection?: number
  title?: string
  showFilters?: boolean
}

export function ExerciseSelector({
  selectedExercises = [],
  onExerciseToggle,
  onClose,
  maxSelection,
  title = "Seleccionar Ejercicios",
  showFilters = true
}: ExerciseSelectorProps) {
  const { exercises, filters, updateFilter, resetFilters, isFirstLoad } = useExercises()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const selectedIds = selectedExercises.map(ex => ex.id)
  const canSelectMore = !maxSelection || selectedExercises.length < maxSelection

  const filteredExercises = exercises.filter(exercise => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return exercise.name.toLowerCase().includes(query) ||
             exercise.muscle_group_primary.toLowerCase().includes(query)
    }
    return true
  })

  const handleExerciseClick = (exercise: Exercise) => {
    const isSelected = selectedIds.includes(exercise.id)
    
    if (isSelected) {
      // Siempre permitir deseleccionar
      onExerciseToggle(exercise)
    } else if (canSelectMore) {
      // Solo permitir seleccionar si no se alcanzó el máximo
      onExerciseToggle(exercise)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">
            {selectedExercises.length} seleccionado{selectedExercises.length !== 1 ? 's' : ''}
            {maxSelection && ` de ${maxSelection}`}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4 border-b border-slate-700">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar ejercicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-slate-400 hover:text-white"
            >
              Filtros Avanzados {showAdvancedFilters ? '−' : '+'}
            </Button>
            
            {showAdvancedFilters && (
              <ExerciseFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onReset={resetFilters}
                isOpen={true}
                onToggle={() => {}}
              />
            )}
          </div>
        )}
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isFirstLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => {
              const isSelected = selectedIds.includes(exercise.id)
              const canSelect = canSelectMore || isSelected
              
              return (
                <div key={exercise.id} className="relative">
                  <div
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isSelected && "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900",
                      !canSelect && !isSelected && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canSelect && handleExerciseClick(exercise)}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      onAddToRoutine={() => canSelect && handleExerciseClick(exercise)}
                      compact={true}
                    />
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={cn(
                    "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    isSelected 
                      ? "bg-blue-500 text-white" 
                      : "bg-slate-700 text-slate-400 border border-slate-600"
                  )}>
                    {isSelected ? <Check size={14} /> : <Plus size={14} />}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">No se encontraron ejercicios</div>
            <Button variant="ghost" onClick={() => {
              setSearchQuery('')
              resetFilters()
            }}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Selected Count Footer */}
      {selectedExercises.length > 0 && (
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {selectedExercises.length} ejercicio{selectedExercises.length !== 1 ? 's' : ''} seleccionado{selectedExercises.length !== 1 ? 's' : ''}
            </span>
            {maxSelection && (
              <span className="text-xs text-slate-500">
                Máximo: {maxSelection}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
