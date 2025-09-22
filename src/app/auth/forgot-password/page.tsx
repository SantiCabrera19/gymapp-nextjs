'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { resetPasswordEmail } from '@/lib/api/auth'
import { Mail } from 'lucide-react'

interface ForgotForm { email: string }
interface FormErrors { email?: string; general?: string }

export default function ForgotPasswordPage() {
  const [form, setForm] = useState<ForgotForm>({ email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const validate = () => {
    const errs: FormErrors = {}
    if (!form.email) errs.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ingresa un email válido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})
    try {
      const res = await resetPasswordEmail(form.email)
      if (!res.success) {
        setErrors({ general: res.error || 'No pudimos enviar el correo. Intenta nuevamente.' })
        return
      }
      setIsSent(true)
    } catch (e) {
      setErrors({ general: 'No pudimos enviar el correo. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresa tu email y te enviaremos un enlace para restablecerla"
    >
      <Card className="border-border-primary/50">
        <CardContent className="p-8">
          {isSent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-status-success/10 ring-1 ring-status-success/20 flex items-center justify-center">
                <span className="text-status-success text-2xl">✓</span>
              </div>
              <p className="text-text-secondary">
                Si la dirección está registrada, recibirás un correo con instrucciones para restablecer tu contraseña.
              </p>
              <Link href="/auth/login">
                <Button variant="outline">Volver al inicio de sesión</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ email: e.target.value })}
                  error={errors.email}
                  disabled={isLoading}
                  className="pl-12"
                />
                <Mail className="absolute left-4 top-[38px] h-5 w-5 text-text-tertiary" />
              </div>

              {errors.general && (
                <div className="p-4 rounded-md bg-status-error/10 border border-status-error/20">
                  <p className="text-sm text-status-error">{errors.general}</p>
                </div>
              )}

              <Button type="submit" variant="outline" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>

              <div className="text-center">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="mt-2">Volver al inicio de sesión</Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
