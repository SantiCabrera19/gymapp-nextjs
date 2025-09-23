'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { useAuth } from '@/hooks'
import { ProfilePageSkeleton } from '@/components/ui'

export default function ProfilePage() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <AppLayout>
        <ProfilePageSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Mi Perfil</h1>
          <p className="text-text-secondary">
            Personaliza tu información y preferencias para una mejor experiencia
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm />
      </div>
    </AppLayout>
  )
}
