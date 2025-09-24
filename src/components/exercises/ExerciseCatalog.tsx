'use client'

import { useState, useEffect } from 'react'
import { Grid, List, Filter } from 'lucide-react'
import { Button } from '@/components/ui'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseSearch } from './ExerciseSearch'
import { ExerciseFilters } from './ExerciseFilters'
import { ExercisesGridSkeleton } from './ExercisesSkeleton'
import { Pagination } from '@/components/ui/Pagination'
import { useExercises } from '@/hooks/useExercises'
import { usePagination } from '@/hooks/usePagination'
import { Exercise } from '@/types/exercises'
import { cn } from '@/lib/utils'

export function ExerciseCatalog() {
  const { exercises, isFirstLoad, filters, updateFilter, resetFilters, filteredCount, totalCount } = useExercises()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Paginación
  const {
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    paginatedData,
    goToPage,
    resetPage,
    startIndex,
    endIndex
  } = usePagination({ data: exercises, itemsPerPage: 9 })
  
  // Reset page when filters change
  useEffect(() => {
    resetPage()
  }, [filters, resetPage])

  const handleToggleFavorite = (exerciseId: string) => {
    // TODO: Implementar toggle de favoritos
    console.log('Toggle favorite:', exerciseId)
  }

  const handleViewDetails = (exercise: Exercise) => {
    // TODO: Abrir modal de detalles
    console.log('View details:', exercise)
  }

  const handleAddToRoutine = (exercise: Exercise) => {
    // TODO: Añadir a rutina
    console.log('Add to routine:', exercise)
  }

  // Skeleton SOLO en primera carga, NO al cambiar pestañas
  if (isFirstLoad && exercises.length === 0) {
    return <ExercisesGridSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ExerciseSearch
          value={filters.search}
          onChange={(value) => updateFilter('search', value)}
          onSelectExercise={handleViewDetails}
        />
        
        <div className="flex gap-2">
          <ExerciseFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onReset={resetFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
          
          <div className="flex border border-slate-700 rounded-lg overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid size={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas y filtros activos */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mostrando <span className="text-white font-medium">{startIndex}-{endIndex}</span> de <span className="text-white font-medium">{filteredCount}</span> ejercicios
          {filteredCount !== totalCount && (
            <span className="ml-2 text-xs">({totalCount} total)</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {filters.recommendedOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
              ✨ Recomendados
            </span>
          )}
          
          {(filters.muscleGroups.length > 0 || filters.equipment.length > 0 || filters.difficulty.length > 0 || filters.isFavorite) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-white"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Lista de ejercicios */}
      {exercises.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <Filter size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No se encontraron ejercicios
            </h3>
            <p className="text-slate-400 mb-6">
              Intenta ajustar los filtros o términos de búsqueda
            </p>
          </div>
          <Button variant="outline" onClick={resetFilters}>
            Limpiar todos los filtros
          </Button>
        </div>
      ) : (
        <>
          <div className={cn(
            "transition-all duration-300",
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-4"
          )}>
            {paginatedData.map((exercise, index) => (
              <div
                key={exercise.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ExerciseCard
                  exercise={exercise}
                  onToggleFavorite={handleToggleFavorite}
                  onViewDetails={handleViewDetails}
                  onAddToRoutine={handleAddToRoutine}
                />
              </div>
            ))}
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
