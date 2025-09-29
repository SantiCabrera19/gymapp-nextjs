'use client'

import { Target, Zap } from 'lucide-react'
import { Card } from '@/components/ui'
import { MUSCLE_GROUPS } from '@/types/exercises'
import { cn } from '@/lib/utils'

interface ExerciseMusclesProps {
  primaryMuscle: string
  secondaryMuscles: string[]
}

export function ExerciseMuscles({ primaryMuscle, secondaryMuscles }: ExerciseMusclesProps) {
  const primary = MUSCLE_GROUPS.find(m => m.id === primaryMuscle)
  const secondaries = secondaryMuscles
    .map(id => MUSCLE_GROUPS.find(m => m.id === id))
    .filter(Boolean)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="text-orange-400" size={20} />
          Músculos Trabajados
        </h2>

        <div className="space-y-4">
          {/* Músculo primario */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Zap className="text-red-400" size={16} />
              Músculo Principal
            </h3>

            {primary && (
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
                <span className="text-2xl">{primary.icon}</span>
                <div>
                  <div className="font-medium text-white">{primary.name}</div>
                  <div className="text-xs text-slate-400">Activación principal</div>
                </div>
              </div>
            )}
          </div>

          {/* Músculos secundarios */}
          {secondaries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="text-blue-400" size={16} />
                Músculos Secundarios
              </h3>

              <div className="flex flex-wrap gap-3">
                {secondaries.map(
                  muscle =>
                    muscle && (
                      <div
                        key={muscle.id}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30"
                      >
                        <span className="text-lg">{muscle.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{muscle.name}</div>
                          <div className="text-xs text-slate-400">Soporte</div>
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Placeholder para músculos secundarios si no hay */}
          {secondaries.length === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="text-blue-400" size={16} />
                Músculos Secundarios
              </h3>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                <p className="text-sm text-slate-400">
                  Este ejercicio se enfoca principalmente en un grupo muscular específico
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Diagrama corporal placeholder */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="text-center space-y-2">
            <div className="text-6xl">🏃‍♂️</div>
            <p className="text-sm text-slate-400">Diagrama muscular</p>
            <p className="text-xs text-slate-500">Próximamente disponible</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
