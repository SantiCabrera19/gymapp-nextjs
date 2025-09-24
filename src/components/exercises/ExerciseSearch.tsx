'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input, Card } from '@/components/ui'
import { Exercise } from '@/types/exercises'
import { searchExercises } from '@/lib/api/exercises'
import { cn } from '@/lib/utils'

interface ExerciseSearchProps {
  value: string
  onChange: (value: string) => void
  onSelectExercise?: (exercise: Exercise) => void
  placeholder?: string
}

export function ExerciseSearch({ 
  value, 
  onChange, 
  onSelectExercise,
  placeholder = "Buscar ejercicios por nombre, músculo o equipo..."
}: ExerciseSearchProps) {
  const [suggestions, setSuggestions] = useState<Exercise[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Buscar sugerencias
  useEffect(() => {
    const searchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        setLoading(true)
        const results = await searchExercises(value)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching exercises:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [value])

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSuggestion = (exercise: Exercise) => {
    onChange(exercise.name)
    setShowSuggestions(false)
    onSelectExercise?.(exercise)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    onChange('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && (
        <Card className="absolute top-12 left-0 right-0 z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-400">
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectSuggestion(exercise)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="capitalize">{exercise.muscle_group_primary}</span>
                    {exercise.equipment && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{exercise.equipment}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : value.length >= 2 ? (
            <div className="p-4 text-center text-slate-400">
              No se encontraron ejercicios
            </div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
