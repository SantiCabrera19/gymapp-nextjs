/**
 * Componente para manejar estados de loading con timeout y error handling
 * Previene skeletons infinitos y proporciona UX profesional
 */
'use client'

import { ReactNode } from 'react'
import { RefreshCw, AlertTriangle, Wifi, Clock } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface LoadingErrorBoundaryProps {
  isLoading: boolean
  hasTimedOut: boolean
  error: string | null
  onRetry?: () => void
  onRefresh?: () => void
  children: ReactNode
  loadingSkeleton?: ReactNode
  className?: string
  showElapsedTime?: boolean
  elapsedTime?: number
}

export function LoadingErrorBoundary({
  isLoading,
  hasTimedOut,
  error,
  onRetry,
  onRefresh,
  children,
  loadingSkeleton,
  className,
  showElapsedTime = false,
  elapsedTime = 0
}: LoadingErrorBoundaryProps) {
  
  // Estado de loading normal
  if (isLoading && !hasTimedOut && !error) {
    return (
      <div className={cn("relative", className)}>
        {loadingSkeleton || (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-background-tertiary rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-background-tertiary rounded"></div>
              ))}
            </div>
          </div>
        )}
        
        {/* Indicador de tiempo transcurrido */}
        {showElapsedTime && elapsedTime > 3000 && (
          <div className="absolute top-4 right-4 bg-background-card border border-border-primary rounded-lg px-3 py-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{Math.floor(elapsedTime / 1000)}s</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Estado de timeout
  if (hasTimedOut) {
    return (
      <Card className={cn("p-8 text-center border-status-warning/20 bg-status-warning/5", className)}>
        <div className="w-16 h-16 bg-status-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-status-warning" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Carga Lenta Detectada
        </h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          La página está tardando más de lo esperado en cargar. Esto puede deberse a una conexión lenta o problemas temporales del servidor.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="bg-status-warning hover:bg-status-warning/80 text-black"
            >
              <RefreshCw size={16} className="mr-2" />
              Reintentar
            </Button>
          )}
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              className="border-status-warning/30 text-status-warning hover:bg-status-warning/10"
            >
              <Wifi size={16} className="mr-2" />
              Recargar Página
            </Button>
          )}
        </div>
        <div className="mt-4 text-xs text-text-tertiary">
          Tiempo transcurrido: {Math.floor(elapsedTime / 1000)} segundos
        </div>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card className={cn("p-8 text-center border-status-error/20 bg-status-error/5", className)}>
        <div className="w-16 h-16 bg-status-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-status-error" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Error de Carga
        </h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="bg-status-error hover:bg-status-error/80"
            >
              <RefreshCw size={16} className="mr-2" />
              Reintentar
            </Button>
          )}
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              className="border-status-error/30 text-status-error hover:bg-status-error/10"
            >
              Recargar Página
            </Button>
          )}
        </div>
        
        {/* Sugerencias de solución */}
        <div className="mt-6 text-left bg-background-tertiary rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Posibles soluciones:</h4>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Verifica tu conexión a internet</li>
            <li>• Recarga la página (F5 o Ctrl+R)</li>
            <li>• Intenta en unos minutos</li>
            <li>• Contacta soporte si el problema persiste</li>
          </ul>
        </div>
      </Card>
    )
  }

  // Estado normal - mostrar contenido
  return <div className={className}>{children}</div>
}
