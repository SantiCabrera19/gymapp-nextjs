'use client'

import { Button } from '@/components/ui'
import { Save, Loader2, RotateCcw, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SaveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  type?: 'save' | 'discard'
}

export function SaveButton({ 
  children, 
  onClick, 
  disabled, 
  isLoading, 
  variant = 'default',
  type = 'save'
}: SaveButtonProps) {
  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    if (type === 'discard') return <RotateCcw className="h-4 w-4 mr-2" />
    return <Save className="h-4 w-4 mr-2" />
  }

  const getLoadingText = () => {
    if (type === 'discard') return 'Descartando...'
    return 'Guardando...'
  }

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "min-w-[120px] transition-all duration-200",
        variant === 'default' && "shadow-lg hover:shadow-xl hover:scale-105",
        variant === 'ghost' && "hover:bg-background-tertiary",
        disabled && !isLoading && "opacity-50 cursor-not-allowed",
        isLoading && "cursor-wait"
      )}
    >
      {isLoading ? (
        <>
          {getIcon()}
          {getLoadingText()}
        </>
      ) : (
        <>
          {getIcon()}
          {children}
        </>
      )}
    </Button>
  )
}
