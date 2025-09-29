import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// =====================================================
// ERROR HANDLING UTILITIES
// =====================================================

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Errores específicos de Supabase
    if (error.message.includes('JWT')) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.'
    }

    if (error.message.includes('permission')) {
      return 'No tienes permisos para realizar esta acción.'
    }

    if (error.message.includes('duplicate')) {
      return 'Ya existe un elemento con ese nombre.'
    }

    return error.message
  }

  return 'Ha ocurrido un error inesperado.'
}

export function logError(error: unknown, context?: string) {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  }

  console.error('App Error:', errorInfo)

  // En producción, enviar a servicio de logging
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrar con servicio de logging (Sentry, LogRocket, etc.)
  }
}
