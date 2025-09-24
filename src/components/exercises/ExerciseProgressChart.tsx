'use client'

import { useState } from 'react'
import { TrendingUp, Calendar, BarChart3, Activity, LineChart } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuthAction } from '@/hooks/useRequireAuth'

interface ExerciseProgressChartProps {
  exerciseId: string
}

interface ChartDataPoint {
  date: string
  value: number
  label: string
}

interface ChartData {
  weight: ChartDataPoint[]
  volume: ChartDataPoint[]
  reps: ChartDataPoint[]
}

export function ExerciseProgressChart({ exerciseId }: ExerciseProgressChartProps) {
  const { requireAuth, isAuthenticated } = useAuthAction()
  const [chartType, setChartType] = useState<'weight' | 'volume' | 'reps'>('weight')

  // TODO: Replace with real API call - useExerciseProgress(exerciseId)
  const hasData = false
  const chartData = hasData ? {
    weight: [
      { date: '2024-03', value: 20, label: '20kg' },
      { date: '2024-04', value: 22.5, label: '22.5kg' },
      { date: '2024-05', value: 25, label: '25kg' },
      { date: '2024-06', value: 27.5, label: '27.5kg' },
      { date: '2024-07', value: 30, label: '30kg' },
      { date: '2024-08', value: 32.5, label: '32.5kg' }
    ],
    volume: [
      { date: '2024-03', value: 1200, label: '1,200kg' },
      { date: '2024-04', value: 1350, label: '1,350kg' },
      { date: '2024-05', value: 1500, label: '1,500kg' },
      { date: '2024-06', value: 1650, label: '1,650kg' },
      { date: '2024-07', value: 1800, label: '1,800kg' },
      { date: '2024-08', value: 1950, label: '1,950kg' }
    ],
    reps: [
      { date: '2024-03', value: 8, label: '8 reps' },
      { date: '2024-04', value: 10, label: '10 reps' },
      { date: '2024-05', value: 10, label: '10 reps' },
      { date: '2024-06', value: 12, label: '12 reps' },
      { date: '2024-07', value: 12, label: '12 reps' },
      { date: '2024-08', value: 15, label: '15 reps' }
    ]
  } : null

  const currentData: ChartDataPoint[] = chartData?.[chartType] || []
  const maxValue = currentData.length > 0 ? Math.max(...currentData.map(d => d.value)) : 0

  const getChartColor = (type: string) => {
    switch (type) {
      case 'weight': return 'bg-blue-500'
      case 'volume': return 'bg-green-500'
      case 'reps': return 'bg-purple-500'
      default: return 'bg-blue-500'
    }
  }

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'weight': return <BarChart3 size={16} />
      case 'volume': return <TrendingUp size={16} />
      case 'reps': return <Activity size={16} />
      default: return <BarChart3 size={16} />
    }
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<LineChart size={48} />}
        title="Inicia Sesión para Ver Progreso"
        description="Necesitas estar autenticado para ver tus gráficos de progreso y evolución en los ejercicios."
        action={{
          label: "Iniciar Sesión",
          onClick: () => requireAuth(() => {})
        }}
      />
    )
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={<BarChart3 size={48} />}
        title="Sin Datos de Progreso"
        description="Comienza a entrenar para ver tu progreso a lo largo del tiempo. Cada entrenamiento se registrará aquí."
        action={{
          label: "Iniciar Entrenamiento",
          onClick: () => {
            // TODO: Navigate to training module
            // router.push('/training/new')
          }
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Selector de tipo de gráfico */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={chartType === 'weight' ? 'default' : 'outline'}
          onClick={() => setChartType('weight')}
        >
          <BarChart3 size={16} />
          Peso Máximo
        </Button>
        <Button
          size="sm"
          variant={chartType === 'volume' ? 'default' : 'outline'}
          onClick={() => setChartType('volume')}
        >
          <TrendingUp size={16} />
          Volumen Total
        </Button>
        <Button
          size="sm"
          variant={chartType === 'reps' ? 'default' : 'outline'}
          onClick={() => setChartType('reps')}
        >
          <Activity size={16} />
          Repeticiones
        </Button>
      </div>

      {/* Gráfico simple con barras */}
      <div className="p-6 bg-slate-800/30 rounded-lg">
        <div className="space-y-4">
          {/* Título del gráfico */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white flex items-center gap-2">
              {getChartIcon(chartType)}
              {chartType === 'weight' && 'Evolución del Peso Máximo'}
              {chartType === 'volume' && 'Evolución del Volumen Total'}
              {chartType === 'reps' && 'Evolución de Repeticiones Máximas'}
            </h4>
            <div className="text-sm text-slate-400 flex items-center gap-1">
              <Calendar size={14} />
              Últimos 6 meses
            </div>
          </div>

          {/* Gráfico de barras simple */}
          <div className="space-y-2">
            {currentData.map((item: ChartDataPoint, index: number) => (
              <div key={item.date} className="flex items-center gap-3">
                <div className="w-16 text-xs text-slate-400 text-right">
                  {item.date.split('-')[1]}/24
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 bg-slate-700/50 rounded-md overflow-hidden">
                    <div
                      className={`h-full ${getChartColor(chartType)} transition-all duration-500 ease-out rounded-md`}
                      style={{ 
                        width: `${(item.value / maxValue) * 100}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
            <div className="text-center">
              <div className="text-xs text-slate-400">Progreso</div>
              <div className="text-sm font-semibold text-green-400">+62.5%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Mejor mes</div>
              <div className="text-sm font-semibold text-white">Agosto</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Consistencia</div>
              <div className="text-sm font-semibold text-blue-400">100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
