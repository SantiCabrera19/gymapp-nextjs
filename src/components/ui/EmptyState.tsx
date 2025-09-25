'use client'

import { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-slate-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="transition-all duration-200 hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
