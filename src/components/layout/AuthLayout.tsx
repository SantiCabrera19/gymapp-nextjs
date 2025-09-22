'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showBackButton?: boolean
}

export function AuthLayout({ children, title, subtitle, showBackButton = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Header with back button */}
      <header className="p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Link>
              </Button>
            )}
          </div>
          {/* Right side intentionally empty (logo reservado para futuro) */}
          <div />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Title section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
            <p className="text-lg text-text-secondary">{subtitle}</p>
          </div>

          {/* Form content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-text-tertiary">
          © {new Date().getFullYear()} GymApp — Tu compañero de entrenamiento
        </p>
      </footer>
    </div>
  )
}
