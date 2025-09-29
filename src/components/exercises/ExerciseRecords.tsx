'use client'

import { Award, TrendingUp, Zap, Target, Dumbbell } from 'lucide-react'
import { Card } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuthAction } from '@/hooks/useRequireAuth'
import { useExerciseRecords } from '@/hooks'

interface ExerciseRecordsProps {
  exerciseId: string
}

export function ExerciseRecords({ exerciseId }: ExerciseRecordsProps) {
  const { requireAuth, isAuthenticated } = useAuthAction()

  // Usar hook real para obtener records
  const { records: exerciseRecords, loading, error } = useExerciseRecords(exerciseId)
  const hasData = exerciseRecords && Object.keys(exerciseRecords).length > 0

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Award className="text-yellow-400" size={20} />
          Records Personales
        </h2>

        {!isAuthenticated ? (
          <EmptyState
            icon={<Award size={48} />}
            title="Inicia Sesión para Ver Records"
            description="Necesitas estar autenticado para ver tus records personales y estadísticas de entrenamiento."
            action={{
              label: 'Iniciar Sesión',
              onClick: () => requireAuth(() => {}),
            }}
          />
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<Award size={48} />}
            title="Error al cargar records"
            description="No pudimos cargar tus records personales. Intenta nuevamente."
          />
        ) : !hasData ? (
          <EmptyState
            icon={<Dumbbell size={48} />}
            title="Sin Records Aún"
            description="Comienza a entrenar para establecer tus primeros records personales. Cada entrenamiento te acercará a nuevas metas."
            action={{
              label: 'Iniciar Entrenamiento',
              onClick: () => {
                window.location.href = '/training'
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Records cards would go here when hasData is true */}
          </div>
        )}
      </div>
    </Card>
  )
}
