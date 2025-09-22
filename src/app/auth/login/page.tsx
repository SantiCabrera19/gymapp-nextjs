'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { signIn, signInWithGoogle } from '@/lib/api/auth'
import { GoogleButton } from '@/components/auth'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
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
      const res = await signIn({ email: form.email, password: form.password })
      if (!res.success) {
        const message = res.error?.includes('Invalid login credentials')
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : res.error || 'No se pudo iniciar sesión.'
        setErrors({ general: message })
        return
      }
      router.push('/dashboard')
    } catch (error) {
      setErrors({ general: 'Error al iniciar sesión. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithGoogle()
      if (!res.success && res.error) {
        setErrors({ general: 'No pudimos conectar con Google. Intenta nuevamente.' })
      }
    } catch (error) {
      setErrors({ general: 'Error al conectar con Google. Intenta nuevamente.' })
    }
  }

  const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión para continuar tu progreso"
    >
      <Card className="border-border-primary/50">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Tu contraseña"
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
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Forgot password */}
            <div className="text-center">
              <Link href="/auth/forgot-password">
                <Button variant="outline" size="sm" className="mt-2">
                  ¿Olvidaste tu contraseña?
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-primary" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background-primary text-text-tertiary">o continúa con</span>
        </div>
      </div>

      {/* Google login */}
      <GoogleButton onClick={handleGoogleLogin} disabled={isLoading}>
        Continuar con Google
      </GoogleButton>

      {/* Sign up link */}
      <div className="text-center space-y-2">
        <p className="text-text-secondary">¿No tienes una cuenta?</p>
        <Link href="/auth/register">
          <Button variant="outline" size="lg" className="w-full">
            Crear cuenta nueva
          </Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
