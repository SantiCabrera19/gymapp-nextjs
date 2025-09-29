'use client'

import { useState } from 'react'
import { PersonalInfoSection } from '@/components/profile/PersonalInfoSection'
import { PhysicalDataSection } from '@/components/profile/PhysicalDataSection'
import { PreferencesSection } from '@/components/profile/PreferencesSection'
import { AvatarSection } from '@/components/profile/AvatarSection'
import { SaveButton } from '@/components/profile/SaveButton'
import { useProfileForm } from '@/hooks'
import { useAuth } from '@/hooks'
import { Card } from '@/components/ui'
import { Toast, useToast } from '@/components/ui/Toast'

export function ProfileForm() {
  const { formData, errors, isLoading, isDirty, updateField, handleSave, resetForm } =
    useProfileForm()

  const { toast, hideToast } = useToast()
  const { updateProfile } = useAuth()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Avatar Section - Always visible */}
      <AvatarSection
        avatar={formData.avatar_url || undefined}
        name={formData.full_name || undefined}
        onAvatarChange={(url: string | null) => {
          updateField('avatar_url', url)
          // Actualizar también en el contexto de auth para que se refleje inmediatamente
          updateProfile({ avatar_url: url })
        }}
      />

      {/* Form Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PersonalInfoSection
          data={formData}
          errors={errors}
          isActive={activeSection === 'personal'}
          onFocus={() => setActiveSection('personal')}
          onBlur={() => setActiveSection(null)}
          onChange={updateField}
        />

        <PhysicalDataSection
          data={formData}
          errors={errors}
          isActive={activeSection === 'physical'}
          onFocus={() => setActiveSection('physical')}
          onBlur={() => setActiveSection(null)}
          onChange={updateField}
        />
      </div>

      <PreferencesSection
        data={formData}
        errors={errors}
        isActive={activeSection === 'preferences'}
        onFocus={() => setActiveSection('preferences')}
        onBlur={() => setActiveSection(null)}
        onChange={updateField}
      />

      {/* Save Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {isDirty ? 'Tienes cambios sin guardar' : 'Todos los cambios guardados'}
          </div>
          <div className="flex gap-3">
            <SaveButton
              variant="ghost"
              type="discard"
              onClick={resetForm}
              disabled={!isDirty || isLoading}
            >
              Descartar
            </SaveButton>
            <SaveButton
              variant="outline"
              type="save"
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              isLoading={isLoading}
            >
              Guardar Cambios
            </SaveButton>
          </div>
        </div>
      </Card>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  )
}
