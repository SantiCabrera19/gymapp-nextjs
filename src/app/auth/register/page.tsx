'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { signUp, signInWithGoogle } from '@/lib/api/auth'
import { GoogleButton } from '@/components/auth'
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react'

interface RegisterForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordRequirement {
  text: string
  met: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

    if (!form.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!form.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!isPasswordValid) {
      newErrors.password = 'La contraseña no cumple con los requisitos'
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
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
      const res = await signUp({
        email: form.email,
        password: form.password,
        full_name: form.fullName,
      } as any)

      if (!res.success) {
        const msg = res.error?.includes('User already registered')
          ? 'Este email ya está registrado.'
          : res.error || 'No se pudo crear la cuenta.'
        setErrors({ general: msg })
        return
      }

      // Si tienes confirmación por email activada, el usuario debe verificar el correo antes de iniciar sesión.
      router.push('/dashboard')
    } catch (error) {
      setErrors({ general: 'Error al crear la cuenta. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      const res = await signInWithGoogle()
      if (!res.success && res.error) {
        setErrors({ general: res.error })
      }
    } catch (error) {
      setErrors({ general: 'Error al conectar con Google. Intenta nuevamente.' })
    }
  }

  const handleInputChange = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Únete a GymApp y comienza tu transformación"
    >
      <Card className="border-border-primary/50">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name field */}
            <div className="relative">
              <Input
                label="Nombre completo"
                type="text"
                placeholder="Tu nombre completo"
                value={form.fullName}
                onChange={handleInputChange('fullName')}
                error={errors.fullName}
                disabled={isLoading}
                className="pl-12"
              />
              <User className="absolute left-4 top-[38px] h-5 w-5 text-text-tertiary" />
            </div>

            {/* Email field */}
            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                disabled={isLoading}
                className="pl-12"
              />
              <Mail className="absolute left-4 top-[38px] h-5 w-5 text-text-tertiary" />
            </div>

            {/* Password field */}
            <div className="relative">
              <Input
                label="Contraseña"
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
                      {req.met ? (
                        <Check className="h-4 w-4 text-status-success" />
                      ) : (
                        <X className="h-4 w-4 text-text-tertiary" />
                      )}
                      <span className={`text-xs ${req.met ? 'text-status-success' : 'text-text-tertiary'}`}>
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
                label="Confirmar contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu contraseña"
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

            {/* Terms acceptance */}
            <div className="text-sm text-text-secondary">
              Al crear una cuenta, aceptas nuestros{' '}
              <Link href="/terms" className="text-accent-primary hover:text-accent-hover">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-accent-primary hover:text-accent-hover">
                Política de Privacidad
              </Link>
            </div>

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
                  Creando cuenta...
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-primary" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background-primary text-text-tertiary">o regístrate con</span>
        </div>
      </div>

      {/* Google register */}
      <GoogleButton onClick={handleGoogleRegister} disabled={isLoading}>
        Continuar con Google
      </GoogleButton>

      {/* Login link */}
      <div className="text-center space-y-2">
        <p className="text-text-secondary">¿Ya tienes una cuenta?</p>
        <Link href="/auth/login">
          <Button variant="outline" size="lg" className="w-full">
            Iniciar Sesión
          </Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
