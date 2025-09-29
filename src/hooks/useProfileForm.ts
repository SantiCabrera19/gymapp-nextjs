'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { updateUserProfile } from '@/lib/api/auth'
import { useToast } from '@/components/ui/Toast'
import type { Tables } from '@/types/database'

type ProfileFormData = Partial<Tables<'users'>> & {
  confirmEmail?: string
}

interface FormErrors {
  [key: string]: string | undefined
}

export function useProfileForm() {
  const { profile, user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [formData, setFormData] = useState<ProfileFormData>({})
  const [originalData, setOriginalData] = useState<ProfileFormData>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (profile) {
      const initialData = {
        full_name: profile.full_name || '',
        username: profile.username || '',
        email: user?.email || '',
        bio: profile.bio || '',
        weight_kg: profile.weight_kg || null,
        height_cm: profile.height_cm || null,
        date_of_birth: profile.date_of_birth || null,
        experience_level: profile.experience_level || 'beginner',
        preferred_units: profile.preferred_units || 'metric',
        timezone: profile.timezone || 'America/Argentina/Buenos_Aires',
        avatar_url: profile.avatar_url || '',
      }
      setFormData(initialData)
      setOriginalData(initialData)
    }
  }, [profile, user])

  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData)

  const updateField = useCallback(
    (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    },
    [errors]
  )

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'El nombre es requerido'
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres'
    }

    if (formData.weight_kg && (formData.weight_kg < 30 || formData.weight_kg > 300)) {
      newErrors.weight_kg = 'Peso debe estar entre 30-300 kg'
    }

    if (formData.height_cm && (formData.height_cm < 100 || formData.height_cm > 250)) {
      newErrors.height_cm = 'Altura debe estar entre 100-250 cm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !user?.id) return

    setIsLoading(true)
    try {
      const { confirmEmail, ...dataToSave } = formData
      const result = await updateUserProfile(user.id, dataToSave)

      if (result.success) {
        setOriginalData(formData)
        showSuccess('Perfil actualizado correctamente')
      } else {
        showError(result.error || 'Error al guardar el perfil')
      }
    } catch (error) {
      showError('Error inesperado al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(originalData)
    setErrors({})
  }

  return {
    formData,
    errors,
    isLoading,
    isDirty,
    updateField,
    handleSave,
    resetForm,
  }
}
