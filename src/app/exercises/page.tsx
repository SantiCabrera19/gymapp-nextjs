'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { ExerciseCatalog } from '@/components/exercises/ExerciseCatalog'
import { Breadcrumbs } from '@/components/ui'

export default function ExercisesPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Ejercicios', href: '/exercises', current: true }
          ]} 
        />
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Catálogo de Ejercicios
          </h1>
          <p className="text-slate-400">
            Descubre ejercicios personalizados para tu nivel y objetivos
          </p>
        </div>
        
        {/* Catalog */}
        <ExerciseCatalog />
      </div>
    </AppLayout>
  )
}
