'use client'

import { CheckCircle, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui'

interface ExerciseTechniqueProps {
  instructions: string[]
  tips: string[]
  commonMistakes: string[]
}

export function ExerciseTechnique({ instructions, tips, commonMistakes }: ExerciseTechniqueProps) {
  return (
    <div className="space-y-6">
      {/* Instrucciones paso a paso */}
      <Card className="p-5">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="text-blue-400" size={20} />
            Técnica Correcta
          </h3>
          
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tips profesionales */}
      <Card className="p-5">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-400" size={20} />
            Tips Profesionales
          </h3>
          
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <CheckCircle className="flex-shrink-0 text-green-400 mt-0.5" size={16} />
                <p className="text-sm text-slate-300 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Errores comunes */}
      <Card className="p-5 border-red-500/20">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={20} />
            Errores Comunes
          </h3>
          
          <div className="space-y-3">
            {commonMistakes.map((mistake, index) => (
              <div key={index} className="flex gap-3">
                <AlertTriangle className="flex-shrink-0 text-red-400 mt-0.5" size={16} />
                <p className="text-sm text-slate-300 leading-relaxed">
                  {mistake}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Consejo del entrenador */}
      <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="space-y-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-400" size={18} />
            Consejo del Entrenador
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            La consistencia en la técnica es más importante que el peso utilizado. 
            Enfócate en la calidad del movimiento antes de aumentar la carga.
          </p>
        </div>
      </Card>
    </div>
  )
}
