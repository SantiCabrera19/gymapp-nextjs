'use client'

import { useState } from 'react'
import { Plus, Grid, List, Calendar, Target } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card } from '@/components/ui'
import { Breadcrumbs } from '@/components/ui'
import { EmptyState } from '@/components/ui/EmptyState'
import { RoutineCard } from '@/components/routines/RoutineCard'
import { RoutineFilters } from '@/components/routines/RoutineFilters'
import { useRoutines } from '@/hooks/useRoutines'
import { useAuth, useAuthAction } from '@/hooks'
import { type Routine } from '@/lib/api/routines'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function RoutinesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { requireAuth } = useAuthAction()

  const {
    routines,
    filters,
    loading,
    error,
    stats,
    availableTags,
    updateFilter,
    resetFilters,
    handleDuplicateRoutine,
    handleDeleteRoutine,
    clearError,
  } = useRoutines()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [deletingRoutine, setDeletingRoutine] = useState<string | null>(null)

  const handleCreateRoutine = () => {
    if (!isAuthenticated) {
      requireAuth(() => router.push('/routines/new'))
      return
    }
    router.push('/routines/new')
  }

  const handleStartRoutine = (routine: Routine) => {
    if (!isAuthenticated) {
      requireAuth(() => {})
      return
    }
    router.push(`/training?routine=${routine.id}`)
  }

  const handleEditRoutine = (routine: Routine) => {
    router.push(`/routines/${routine.id}/edit`)
  }

  const handleDuplicate = async (routine: Routine) => {
    try {
      const newName = `${routine.name} (Copia)`
      await handleDuplicateRoutine(routine, newName)
    } catch (error) {
      console.error('Error duplicating routine:', error)
    }
  }

  const handleDelete = async (routine: Routine) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?`)) {
      return
    }

    try {
      setDeletingRoutine(routine.id)
      await handleDeleteRoutine(routine.id)
    } catch (error) {
      console.error('Error deleting routine:', error)
    } finally {
      setDeletingRoutine(null)
    }
  }

  // Estado no autenticado
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex-1 space-y-6 p-6">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Rutinas', href: '/routines', current: true },
            ]}
          />

          <EmptyState
            icon={<Target size={48} />}
            title="Inicia Sesión para Ver Rutinas"
            description="Necesitas estar autenticado para crear y gestionar tus rutinas de entrenamiento personalizadas."
            action={{
              label: 'Iniciar Sesión',
              onClick: () => requireAuth(() => {}),
            }}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Rutinas', href: '/routines', current: true },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Mis Rutinas</h1>
            <p className="text-text-secondary">
              Crea y gestiona tus rutinas de entrenamiento personalizadas
            </p>
          </div>

          <Button onClick={handleCreateRoutine} className="shrink-0">
            <Plus size={20} className="mr-2" />
            Nueva Rutina
          </Button>
        </div>

        {/* Stats Cards */}
        {!loading && routines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-accent-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-text-secondary">Rutinas</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.byDifficulty.beginner}</div>
                  <div className="text-sm text-text-secondary">Principiante</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.byDifficulty.intermediate}
                  </div>
                  <div className="text-sm text-text-secondary">Intermedio</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.byDifficulty.advanced}</div>
                  <div className="text-sm text-text-secondary">Avanzado</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <RoutineFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onReset={resetFilters}
          availableTags={availableTags}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />

        {/* View Mode Toggle */}
        {!loading && routines.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {routines.length} rutina{routines.length !== 1 ? 's' : ''} encontrada
              {routines.length !== 1 ? 's' : ''}
            </div>

            <div className="flex border border-border-primary rounded-lg overflow-hidden">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-status-error/30 bg-status-error/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-status-error mb-1">
                  Error al cargar rutinas
                </h3>
                <p className="text-text-secondary">{error}</p>
              </div>
              <Button variant="outline" onClick={clearError}>
                Reintentar
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-background-tertiary rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && routines.length === 0 && !error && (
          <EmptyState
            icon={<Calendar size={48} />}
            title="No tienes rutinas creadas"
            description="Crea tu primera rutina para organizar tus entrenamientos y hacer seguimiento de tu progreso de forma estructurada."
            action={{
              label: 'Crear Primera Rutina',
              onClick: handleCreateRoutine,
            }}
          />
        )}

        {/* Routines Grid/List */}
        {!loading && routines.length > 0 && (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {routines.map(routine => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onStart={handleStartRoutine}
                onEdit={handleEditRoutine}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
