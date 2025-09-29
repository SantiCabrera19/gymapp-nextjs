/**
 * Utilidades para manejo de errores en el módulo de rutinas
 */

export class RoutineError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'RoutineError'
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof RoutineError) {
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
    
    if (error.message.includes('not found')) {
      return 'El recurso solicitado no fue encontrado.'
    }
    
    return error.message
  }
  
  return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
}

export function logError(error: unknown, context?: string) {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString()
  }
  
  // En desarrollo, mostrar en consola
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorInfo)
  }
  
  // En producción, enviar a servicio de logging
  // TODO: Integrar con servicio de logging (Sentry, LogRocket, etc.)
}
