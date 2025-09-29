'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button, Progress, DashboardSkeleton } from '@/components/ui'
import { LoadingErrorBoundary } from '@/components/ui/LoadingErrorBoundary'
import { useAuth } from '@/hooks'
import {
  Play,
  Calendar,
  TrendingUp,
  Plus,
  Dumbbell,
  Clock,
  Users,
  BookOpen,
  Target,
} from 'lucide-react'
export default function DashboardPage() {
  const { isAuthenticated, profile, loading, hasTimedOut, retry } = useAuth()

  return (
    <AppLayout>
      <div className="space-y-8">
        <LoadingErrorBoundary
          isLoading={loading}
          error={null}
          hasTimedOut={hasTimedOut}
          onRetry={retry}
          onRefresh={() => window.location.reload()}
          loadingSkeleton={<DashboardSkeleton />}
        >
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white leading-tight">
                  {isAuthenticated
                    ? `Hola, ${profile?.full_name?.split(' ')[0] || 'Usuario'}`
                    : '¡Bienvenido a GymApp!'}
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {isAuthenticated
                    ? 'Continúa tu progreso y alcanza tus objetivos'
                    : 'Inicia sesión para acceder a todas las funcionalidades'}
                </p>
              </div>
              {isAuthenticated && (
                <Button variant="outline" size="default" className="w-full sm:w-auto rounded-md">
                  <div className="w-4 h-4 rounded-sm bg-white/20 mr-2 flex items-center justify-center ring-1 ring-white/20">
                    <Plus className="h-3 w-3" />
                  </div>
                  Crear Rutina
                </Button>
              )}
            </div>

            {/* Conditional content based on authentication */}
            {isAuthenticated ? (
              // Authenticated user dashboard
              <div className="!grid !grid-cols-1 md:!grid-cols-2 xl:!grid-cols-3 !gap-8 !w-full !mt-8">
                {/* Card 1: Rutina Activa */}
                <Card className="!flex !flex-col !h-full border-accent-primary/20 !p-6">
                  <CardHeader className="pb-4 !p-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Rutina Activa</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-sky-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="!flex-1 !p-0 !pt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        No tienes rutina activa
                      </p>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="w-full h-10">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primera Rutina
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Entrenamientos */}
                <Card className="!flex !flex-col !h-full !p-6">
                  <CardHeader className="pb-4 !p-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Entrenamientos</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="!flex-1 !p-0 !pt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Historial de entrenamientos
                      </p>
                      <p className="text-2xl font-bold text-text-primary">0 completados</p>
                      <p className="text-xs text-text-tertiary leading-relaxed">
                        ¡Comienza tu primer entrenamiento!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Progreso */}
                <Card className="!flex !flex-col !h-full !p-6">
                  <CardHeader className="pb-4 !p-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Tu Progreso</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="!flex-1 !p-0 !pt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Progreso esta semana
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-text-primary">0/7</span>
                        <span className="text-sm text-text-tertiary">días activos</span>
                      </div>
                      <div className="pt-2">
                        <Progress value={0} className="h-3 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Guest user dashboard - Professional showcase
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {/* Feature showcase cards */}
                <Card className="border-accent-primary/20 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Rutinas Personalizadas</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-orange-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-text-secondary">
                        Crea rutinas adaptadas a tus objetivos
                      </p>
                      <ul className="text-xs text-text-tertiary space-y-1">
                        <li>• Planes personalizados</li>
                        <li>• Seguimiento de progreso</li>
                        <li>• Ejercicios guiados</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Base de Ejercicios</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-text-secondary">
                        Biblioteca completa de ejercicios
                      </p>
                      <ul className="text-xs text-text-tertiary space-y-1">
                        <li>• +300 ejercicios</li>
                        <li>• Instrucciones detalladas</li>
                        <li>• Videos demostrativos</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Comunidad Activa</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-violet-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-text-secondary">Únete a miles de usuarios</p>
                      <ul className="text-xs text-text-tertiary space-y-1">
                        <li>• Comparte tu progreso</li>
                        <li>• Rutinas populares</li>
                        <li>• Motivación diaria</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Secondary grid - Conditional content */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mt-12">
              {/* Quick Actions Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-9">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
                      <Dumbbell className="h-3 w-3 text-violet-400" />
                    </span>
                    <span className="text-sm">Explorar Ejercicios</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-9">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
                      <Calendar className="h-3 w-3 text-sky-400" />
                    </span>
                    <span className="text-sm">Ver Rutinas Populares</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-9">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
                      <Play className="h-3 w-3 text-emerald-400" />
                    </span>
                    <span className="text-sm">Entrenar Ya</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Conditional welcome/onboarding card */}
              {isAuthenticated ? (
                // User stats or recent activity
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center py-6">
                        <div className="w-12 h-12 rounded-full bg-background-tertiary/50 flex items-center justify-center mx-auto mb-3">
                          <Calendar className="h-6 w-6 text-text-tertiary" />
                        </div>
                        <p className="text-sm text-text-secondary">No hay actividad reciente</p>
                        <p className="text-xs text-text-tertiary">
                          ¡Comienza tu primer entrenamiento!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Getting started for guests
                <Card variant="highlighted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">¡Bienvenido a GymApp!</CardTitle>
                    <CardDescription className="text-sm">
                      Crea tu primera rutina para comenzar tu viaje fitness
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-accent-primary">1</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            Explora ejercicios disponibles
                          </p>
                          <p className="text-xs text-text-tertiary">Descubre nuestra biblioteca</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-accent-primary">2</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            Crea tu primera rutina
                          </p>
                          <p className="text-xs text-text-tertiary">
                            Personaliza según tus objetivos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-accent-primary">3</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            Comienza a entrenar
                          </p>
                          <p className="text-xs text-text-tertiary">Sigue tu progreso día a día</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Crear Mi Primera Rutina
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        </LoadingErrorBoundary>
      </div>
    </AppLayout>
  )
}
