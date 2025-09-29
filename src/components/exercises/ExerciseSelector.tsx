'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Check, Plus, X, ArrowLeft, Filter, Zap, Heart } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { ExerciseGridSkeleton, FiltersSkeleton } from '@/components/ui/Skeleton'
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
  showPreview?: boolean
  onClearSelection?: () => void
  className?: string
}

export function ExerciseSelector({
  selectedExercises = [],
  onExerciseToggle,
  onClose,
  maxSelection,
  title = "Seleccionar Ejercicios",
  showFilters = true,
  showPreview = true,
  onClearSelection,
  className
}: ExerciseSelectorProps) {
  const { exercises, filters, updateFilter, resetFilters, isFirstLoad } = useExercises()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedIds = selectedExercises.map(ex => ex.id)
  const canSelectMore = !maxSelection || selectedExercises.length < maxSelection
  const muscleGroups = Array.from(new Set(selectedExercises.map(ex => ex.muscle_group_primary)))
  const totalSets = selectedExercises.length * 3 // Estimación básica

  const filteredExercises = exercises.filter(exercise => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return exercise.name.toLowerCase().includes(query) ||
             exercise.muscle_group_primary.toLowerCase().includes(query)
    }
    return true
  })

  const handleExerciseClick = useCallback((exercise: Exercise) => {
    const isSelected = selectedIds.includes(exercise.id)
    
    if (isSelected) {
      onExerciseToggle(exercise)
    } else if (canSelectMore) {
      onExerciseToggle(exercise)
      // Mostrar feedback de éxito
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    }
  }, [selectedIds, canSelectMore, onExerciseToggle])

  const handleClose = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      onClose?.()
      setIsAnimating(false)
    }, 200)
  }, [onClose])

  const handleClearAll = useCallback(() => {
    if (onClearSelection) {
      onClearSelection()
    } else {
      selectedExercises.forEach(exercise => onExerciseToggle(exercise))
    }
  }, [selectedExercises, onExerciseToggle, onClearSelection])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  // Focus management
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus()
    }
  }, [])

  return (
    <div 
      ref={modalRef}
      className={cn(
        "flex flex-col h-full max-h-[85vh] bg-background-secondary rounded-lg border border-border-primary overflow-hidden",
        "transform transition-all duration-300 ease-out",
        isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-selector-title"
    >
      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-4 right-4 z-50 bg-status-success text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ease-out animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span className="text-sm font-medium">Ejercicio agregado</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-primary bg-background-tertiary">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Cerrar selector"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <div>
            <h3 id="exercise-selector-title" className="text-xl font-semibold text-white">
              {title}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {selectedExercises.length} seleccionado{selectedExercises.length !== 1 ? 's' : ''}
              {maxSelection && ` de ${maxSelection}`}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {selectedExercises.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              className="text-text-secondary hover:text-text-primary"
            >
              Limpiar todo
            </Button>
          )}
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Cerrar"
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters - Sticky */}
      <div className="sticky top-0 z-10 bg-background-secondary border-b border-border-primary">
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <Input
              ref={searchRef}
              placeholder="Buscar por nombre o músculo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background-tertiary border-border-primary focus:border-accent-primary"
              aria-label="Buscar ejercicios"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={showAdvancedFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm"
            >
              <Filter size={16} className="mr-2" />
              Filtros {showAdvancedFilters ? '−' : '+'}
            </Button>
            
            {/* Quick filter buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('isFavorite', !filters.isFavorite)}
              className={cn(
                "text-sm",
                filters.isFavorite && "bg-accent-primary/20 border-accent-primary text-accent-primary"
              )}
            >
              <Heart size={16} className="mr-1" />
              Favoritos
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('equipment', filters.equipment.includes('bodyweight') ? [] : ['bodyweight'])}
              className={cn(
                "text-sm",
                filters.equipment.includes('bodyweight') && "bg-accent-primary/20 border-accent-primary text-accent-primary"
              )}
            >
              <Zap size={16} className="mr-1" />
              Sin equipo
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && showAdvancedFilters && (
            <div className="transform transition-all duration-300 ease-out">
              <ExerciseFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onReset={resetFilters}
                isOpen={true}
                onToggle={() => {}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {isFirstLoad ? (
              <ExerciseGridSkeleton count={9} />
            ) : filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise, index) => {
                  const isSelected = selectedIds.includes(exercise.id)
                  const canSelect = canSelectMore || isSelected
                  
                  return (
                    <div 
                      key={exercise.id} 
                      className="relative group"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 50}ms both`
                      }}
                    >
                      <div
                        className={cn(
                          "cursor-pointer transition-all duration-300 transform",
                          "hover:scale-105 hover:shadow-lg",
                          isSelected && "ring-2 ring-accent-primary ring-offset-2 ring-offset-background-secondary scale-105",
                          !canSelect && !isSelected && "opacity-50 cursor-not-allowed hover:scale-100"
                        )}
                        onClick={() => canSelect && handleExerciseClick(exercise)}
                        role="button"
                        tabIndex={canSelect ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Deseleccionar' : 'Seleccionar'} ejercicio ${exercise.name}`}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && canSelect) {
                            e.preventDefault()
                            handleExerciseClick(exercise)
                          }
                        }}
                      >
                        <ExerciseCard
                          exercise={exercise}
                          onAddToRoutine={() => canSelect && handleExerciseClick(exercise)}
                          compact={true}
                          isSelected={isSelected}
                          showAddButton={false}
                        />
                      </div>
                      
                      {/* Selection Indicator */}
                      <div className={cn(
                        "absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg",
                        "group-hover:scale-110",
                        isSelected 
                          ? "bg-accent-primary text-white scale-110" 
                          : "bg-background-card text-text-tertiary border-2 border-border-primary group-hover:border-accent-primary group-hover:text-accent-primary"
                      )}>
                        {isSelected ? (
                          <Check size={16} className="animate-in zoom-in-50 duration-200" />
                        ) : (
                          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                        )}
                      </div>
                      
                      {/* Max selection overlay */}
                      {!canSelect && !isSelected && (
                        <div className="absolute inset-0 bg-background-secondary/80 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-text-tertiary text-sm font-medium">Máximo alcanzado</div>
                            <div className="text-text-muted text-xs">({maxSelection} ejercicios)</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-background-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchQuery ? 'No se encontraron ejercicios' : 'Sin resultados'}
                </h3>
                <p className="text-text-secondary mb-4">
                  {searchQuery 
                    ? `No hay ejercicios que coincidan con "${searchQuery}"` 
                    : 'Ajusta los filtros para ver ejercicios'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSearchQuery('')
                      resetFilters()
                    }}
                  >
                    Restablecer filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Sidebar */}
        {showPreview && selectedExercises.length > 0 && (
          <div className="w-80 border-l border-border-primary bg-background-tertiary overflow-y-auto">
            <div className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Check size={20} className="text-accent-primary" />
                Ejercicios Seleccionados
              </h4>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-background-card p-3 rounded-lg">
                  <div className="text-xl font-bold text-white">{selectedExercises.length}</div>
                  <div className="text-xs text-text-secondary">Ejercicios</div>
                </div>
                <div className="bg-background-card p-3 rounded-lg">
                  <div className="text-xl font-bold text-white">~{totalSets}</div>
                  <div className="text-xs text-text-secondary">Sets estimados</div>
                </div>
              </div>
              
              {/* Muscle Groups */}
              {muscleGroups.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-text-primary mb-2">Músculos trabajados:</div>
                  <div className="flex flex-wrap gap-1">
                    {muscleGroups.map((muscle, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-accent-primary/20 text-accent-primary text-xs rounded-md border border-accent-primary/30"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Exercises List */}
              <div className="space-y-2">
                {selectedExercises.map((exercise, index) => (
                  <div 
                    key={exercise.id}
                    className="flex items-center gap-3 p-2 bg-background-card rounded-lg group hover:bg-background-secondary transition-colors"
                  >
                    <div className="w-6 h-6 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {exercise.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {exercise.muscle_group_primary}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleExerciseClick(exercise)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-status-error"
                      aria-label={`Quitar ${exercise.name}`}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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
