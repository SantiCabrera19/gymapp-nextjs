'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { type RoutineFilters } from '@/hooks/useRoutines'
import { cn } from '@/lib/utils'

interface RoutineFiltersProps {
  filters: RoutineFilters
  onUpdateFilter: <K extends keyof RoutineFilters>(key: K, value: RoutineFilters[K]) => void
  onReset: () => void
  availableTags: string[]
  isOpen: boolean
  onToggle: () => void
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Principiante', color: 'text-green-400' },
  { value: 'intermediate', label: 'Intermedio', color: 'text-yellow-400' },
  { value: 'advanced', label: 'Avanzado', color: 'text-red-400' },
]

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'name', label: 'Nombre' },
  { value: 'duration', label: 'Duración' },
  { value: 'exercises', label: 'Número de ejercicios' },
]

export function RoutineFilters({
  filters,
  onUpdateFilter,
  onReset,
  availableTags,
  isOpen,
  onToggle,
}: RoutineFiltersProps) {
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const hasActiveFilters =
    filters.search ||
    filters.difficulty.length > 0 ||
    filters.tags.length > 0 ||
    filters.sortBy !== 'created_at' ||
    filters.sortOrder !== 'desc'

  const toggleDifficulty = (difficulty: string) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty]
    onUpdateFilter('difficulty', newDifficulties)
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    onUpdateFilter('tags', newTags)
  }

  const toggleSortOrder = () => {
    onUpdateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            placeholder="Buscar rutinas..."
            value={filters.search}
            onChange={e => onUpdateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={onToggle}
          className={cn(
            'relative',
            hasActiveFilters && 'border-accent-primary text-accent-primary'
          )}
        >
          <Filter size={16} className="mr-2" />
          Filtros
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-primary rounded-full" />
          )}
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background-tertiary rounded-lg border border-border-primary">
          {/* Difficulty Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary mb-2">Dificultad</label>
            <Button
              variant="outline"
              onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
              className="w-full justify-between"
            >
              <span>
                {filters.difficulty.length === 0
                  ? 'Todas'
                  : `${filters.difficulty.length} seleccionada${filters.difficulty.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown size={16} />
            </Button>

            {showDifficultyDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background-tertiary border border-border-primary rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  {DIFFICULTY_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 p-2 hover:bg-background-card rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.difficulty.includes(option.value)}
                        onChange={() => toggleDifficulty(option.value)}
                        className="rounded border-border-primary"
                      />
                      <span className={cn('text-sm', option.color)}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary mb-2">Etiquetas</label>
            <Button
              variant="outline"
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              className="w-full justify-between"
              disabled={availableTags.length === 0}
            >
              <span>
                {filters.tags.length === 0
                  ? 'Todas'
                  : `${filters.tags.length} seleccionada${filters.tags.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown size={16} />
            </Button>

            {showTagsDropdown && availableTags.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background-tertiary border border-border-primary rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {availableTags.map(tag => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 p-2 hover:bg-background-card rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded border-border-primary"
                      />
                      <span className="text-sm text-text-primary">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary mb-2">Ordenar por</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex-1 justify-between"
              >
                <span>{SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label}</span>
                <ChevronDown size={16} />
              </Button>

              <Button variant="outline" onClick={toggleSortOrder} className="px-3">
                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </Button>
            </div>

            {showSortDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background-tertiary border border-border-primary rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onUpdateFilter('sortBy', option.value as any)
                        setShowSortDropdown(false)
                      }}
                      className={cn(
                        'w-full text-left p-2 hover:bg-background-card rounded text-sm transition-colors',
                        filters.sortBy === option.value
                          ? 'text-accent-primary bg-accent-primary/10'
                          : 'text-text-primary'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.difficulty.map(difficulty => {
            const option = DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty)
            return (
              <span
                key={difficulty}
                className="inline-flex items-center gap-1 px-2 py-1 bg-background-tertiary border border-border-primary rounded-md text-sm"
              >
                <span className={option?.color}>{option?.label}</span>
                <button
                  onClick={() => toggleDifficulty(difficulty)}
                  className="hover:text-text-primary"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}

          {filters.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-background-tertiary border border-border-primary rounded-md text-sm"
            >
              <span>{tag}</span>
              <button onClick={() => toggleTag(tag)} className="hover:text-text-primary">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
