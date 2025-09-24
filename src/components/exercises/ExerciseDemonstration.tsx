'use client'

import { useState } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Dumbbell } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ExerciseDemonstrationProps {
  exercise: {
    name: string
    image_url?: string | null
    video_url?: string | null
  }
  showTechnique: boolean
}

export function ExerciseDemonstration({ exercise, showTechnique }: ExerciseDemonstrationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  return (
    <div className="space-y-4">
      {/* Video/Image Container */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden">
        {exercise.video_url ? (
          // Video player (placeholder for now)
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Dumbbell size={48} className="mx-auto text-slate-500" />
              <p className="text-slate-400">Video de demostración</p>
              <p className="text-xs text-slate-500">Próximamente disponible</p>
            </div>
          </div>
        ) : exercise.image_url ? (
          // Static image
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          // Placeholder
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Dumbbell size={48} className="mx-auto text-slate-500" />
              <p className="text-slate-400">Demostración visual</p>
              <p className="text-xs text-slate-500">Imagen próximamente disponible</p>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        {exercise.video_url && (
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsMuted(!isMuted)}
                  className="backdrop-blur-sm bg-white/10 hover:bg-white/20"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="text-sm text-slate-400">Duración</div>
          <div className="text-lg font-semibold text-white">2-3 min</div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="text-sm text-slate-400">Series recomendadas</div>
          <div className="text-lg font-semibold text-white">3-4</div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="text-sm text-slate-400">Repeticiones</div>
          <div className="text-lg font-semibold text-white">8-12</div>
        </div>
      </div>
    </div>
  )
}
