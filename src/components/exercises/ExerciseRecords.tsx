'use client'

import { Award, TrendingUp, Zap, Target, Dumbbell } from 'lucide-react'
import { Card } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuthAction } from '@/hooks/useRequireAuth'

interface ExerciseRecordsProps {
  exerciseId: string
}

export function ExerciseRecords({ exerciseId }: ExerciseRecordsProps) {
  const { requireAuth, isAuthenticated } = useAuthAction()
  
  // TODO: Fetch real data from API
  const hasData = false // Cambiar cuando tengamos datos reales
  const records = hasData ? {
    maxWeight: { value: 85, unit: 'kg', date: '15 Ago 2024' },
    oneRM: { value: 92, unit: 'kg', date: 'Calculado' },
    bestVolumeSeries: { weight: 55, reps: 8, date: '10 Ago 2024' },
    totalVolume: { value: 1950, unit: 'kg', date: 'Este mes' }
  } : null

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
              label: "Iniciar Sesión",
              onClick: () => requireAuth(() => {})
            }}
          />
        ) : !hasData ? (
          <EmptyState
            icon={<Dumbbell size={48} />}
            title="Sin Records Aún"
            description="Comienza a entrenar para establecer tus primeros records personales. Cada entrenamiento te acercará a nuevas metas."
            action={{
              label: "Iniciar Entrenamiento",
              onClick: () => {
                // TODO: Navigate to training module
                // router.push('/training/new')
              }
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
