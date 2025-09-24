'use client'

import { useState } from 'react'
import { Play, Plus, TrendingUp, Dumbbell, Info } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { ExerciseDemonstration } from './ExerciseDemonstration'
import { ExerciseTechnique } from './ExerciseTechnique'
import { ExerciseMuscles } from './ExerciseMuscles'
import { ExerciseProgressChart } from './ExerciseProgressChart'
import { ExerciseRecords } from './ExerciseRecords'
import { DIFFICULTY_LEVELS, MUSCLE_GROUPS } from '@/types/exercises'
import { cn } from '@/lib/utils'

interface ExerciseDetailProps {
  exercise: {
    id: string
    name: string
    slug: string
    description: string
    difficulty_level: string
    muscle_group_primary: string
    equipment: string
    image_url?: string | null
    video_url?: string | null
    instructions: string[]
    tips: string[]
    common_mistakes: string[]
  }
}

export function ExerciseDetailView({ exercise }: ExerciseDetailProps) {
  const [showTechnique, setShowTechnique] = useState(false)
  
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === exercise.difficulty_level)
  const primaryMuscle = MUSCLE_GROUPS.find(m => m.id === exercise.muscle_group_primary)

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header con título y badges */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              {exercise.name}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              {exercise.description}
            </p>
          </div>
          
          {/* Badges */}
          <div className="flex gap-3">
            {difficulty && (
              <div className={cn(
                "px-3 py-2 rounded-full text-sm font-medium border backdrop-blur-sm",
                getDifficultyColor(difficulty.id)
              )}>
                {difficulty.icon} {difficulty.name}
              </div>
            )}
            
            <div className="px-3 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
              <Dumbbell size={16} className="inline mr-2" />
              {exercise.equipment}
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Demostración */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Play className="text-blue-400" size={20} />
                  Demostración
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTechnique(!showTechnique)}
                >
                  <Info size={16} />
                  {showTechnique ? 'Ocultar' : 'Ver'} Técnica
                </Button>
              </div>
              
              <ExerciseDemonstration 
                exercise={exercise}
                showTechnique={showTechnique}
              />
            </div>
          </Card>

          {/* Músculos trabajados */}
          <ExerciseMuscles 
            primaryMuscle={exercise.muscle_group_primary}
            // TODO: Add secondary muscles from database
            secondaryMuscles={[]}
          />

          {/* Gráfico de progreso */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="text-green-400" size={20} />
                Progreso (Últimos 6 meses)
              </h2>
              <ExerciseProgressChart exerciseId={exercise.id} />
            </div>
          </Card>

          {/* Records */}
          <ExerciseRecords exerciseId={exercise.id} />

          {/* Acciones rápidas */}
          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              <Plus size={20} />
              Agregar a Rutina
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              <Play size={20} />
              Iniciar Entrenamiento
            </Button>
          </div>
        </div>

        {/* Sidebar derecho (1/3) */}
        <div className="space-y-6">
          <ExerciseTechnique 
            instructions={exercise.instructions}
            tips={exercise.tips}
            commonMistakes={exercise.common_mistakes}
          />
        </div>
      </div>
    </div>
  )
}
