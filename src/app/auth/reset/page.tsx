'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { updatePassword } from '@/lib/api/auth'
import { Eye, EyeOff, Lock, Check } from 'lucide-react'

interface ResetForm {
  password: string
  confirmPassword: string
}

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordRequirement {
  text: string
  met: boolean
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<ResetForm>({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Verificar si hay token de reset en la URL
  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setErrors({
        general: errorDescription || 'El enlace de recuperación es inválido o ha expirado.',
      })
    }
  }, [searchParams])

  // Password requirements validation
  const passwordRequirements: PasswordRequirement[] = [
    { text: 'Al menos 8 caracteres', met: form.password.length >= 8 },
    { text: 'Una letra mayúscula', met: /[A-Z]/.test(form.password) },
    { text: 'Una letra minúscula', met: /[a-z]/.test(form.password) },
    { text: 'Un número', met: /\d/.test(form.password) },
  ]

  const isPasswordValid = passwordRequirements.every(req => req.met)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!isPasswordValid) {
      newErrors.password = 'La contraseña no cumple con los requisitos'
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const res = await updatePassword(form.password)

      if (!res.success) {
        setErrors({ general: res.error || 'No se pudo actualizar la contraseña.' })
        return
      }

      setIsSuccess(true)
    } catch (error) {
      setErrors({ general: 'Error al actualizar la contraseña. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange =
    (field: keyof ResetForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }

  if (isSuccess) {
    return (
      <AuthLayout
        title="¡Contraseña actualizada!"
        subtitle="Tu contraseña ha sido cambiada exitosamente"
        showBackButton={false}
      >
        <Card className="border-border-primary/50">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-status-success/10 ring-1 ring-status-success/20 flex items-center justify-center mb-6">
              <Check className="h-7 w-7 text-status-success" />
            </div>
            <p className="text-text-secondary mb-6">
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button variant="outline" onClick={() => router.push('/auth/login')}>
              Ir a Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Ingresa tu nueva contraseña para completar la recuperación"
      showBackButton={false}
    >
      <Card className="border-border-primary/50">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password field */}
            <div className="relative">
              <Input
                label="Nueva contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crea una contraseña segura"
                value={form.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                disabled={isLoading}
                className="pl-12 pr-12"
              />
              <Lock className="absolute left-4 top-[38px] h-5 w-5 text-text-tertiary" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password requirements */}
            {form.password && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Requisitos de contraseña:</p>
                <div className="grid grid-cols-2 gap-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check
                        className={`h-4 w-4 ${req.met ? 'text-status-success' : 'text-text-tertiary'}`}
                      />
                      <span
                        className={`text-xs ${req.met ? 'text-status-success' : 'text-text-tertiary'}`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password field */}
            <div className="relative">
              <Input
                label="Confirmar nueva contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu nueva contraseña"
                value={form.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={errors.confirmPassword}
                disabled={isLoading}
                className="pl-12 pr-12"
              />
              <Lock className="absolute left-4 top-[38px] h-5 w-5 text-text-tertiary" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[38px] text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="p-4 rounded-md bg-status-error/10 border border-status-error/20">
                <p className="text-sm text-status-error">{errors.general}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Actualizando contraseña...
                </div>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
