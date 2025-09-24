'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExerciseDetailView } from '@/components/exercises/ExerciseDetailView'
import { Breadcrumbs } from '@/components/ui'
import { notFound } from 'next/navigation'

interface ExerciseDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  // TODO: Fetch exercise by slug
  const { slug: exerciseSlug } = React.use(params)
  
  // Mock data for now - later we'll fetch from API
  const exercise = {
    id: '1',
    name: 'Curl de Bíceps',
    slug: 'curl-de-biceps',
    description: 'Ejercicio fundamental para el desarrollo de los bíceps',
    difficulty_level: 'beginner',
    muscle_group_primary: 'biceps',
    equipment: 'dumbbell',
    image_url: null,
    video_url: null,
    instructions: [
      'Párate con los pies separados al ancho de los hombros',
      'Sostén las mancuernas con los brazos extendidos a los lados',
      'Flexiona los codos llevando las mancuernas hacia los hombros',
      'Baja lentamente controlando el movimiento'
    ],
    tips: [
      'Mantén los codos pegados al cuerpo',
      'No uses impulso para levantar el peso',
      'Controla tanto la fase concéntrica como excéntrica'
    ],
    common_mistakes: [
      'Balancear el cuerpo para generar impulso',
      'Separar los codos del torso',
      'Bajar muy rápido el peso'
    ]
  }

  if (!exercise) {
    notFound()
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Ejercicios', href: '/exercises' },
            { label: exercise.name, href: `/exercises/${exercise.slug}`, current: true }
          ]} 
        />
        
        {/* Exercise Detail View */}
        <ExerciseDetailView exercise={exercise} />
      </div>
    </AppLayout>
  )
}
