'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ModernRadioProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function ModernRadio({
  name,
  value,
  checked,
  onChange,
  children,
  className,
}: ModernRadioProps) {
  return (
    <label
      className={cn(
        'group relative flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200',
        'hover:border-accent-primary/50 hover:bg-accent-primary/5',
        checked
          ? 'border-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/20'
          : 'border-border-primary bg-background-secondary/50',
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
      />

      {/* Custom Radio Indicator */}
      <div
        className={cn(
          'relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 mr-4',
          checked
            ? 'border-accent-primary bg-accent-primary'
            : 'border-border-primary group-hover:border-accent-primary/50'
        )}
      >
        {checked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-scale-in" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>

      {/* Selection Indicator */}
      {checked && (
        <div className="ml-4 text-accent-primary">
          <Check className="h-5 w-5 animate-scale-in" />
        </div>
      )}

      {/* Glow Effect */}
      {checked && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-primary/10 to-transparent opacity-50 pointer-events-none" />
      )}
    </label>
  )
}

interface ModernRadioGroupProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    description?: string
    icon?: React.ReactNode
  }>
  className?: string
}

export function ModernRadioGroup({
  name,
  value,
  onChange,
  options,
  className,
}: ModernRadioGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map(option => (
        <ModernRadio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
        >
          <div className="flex items-center gap-3">
            {option.icon && <div className="text-accent-primary">{option.icon}</div>}
            <div>
              <div className="font-medium text-text-primary">{option.label}</div>
              {option.description && (
                <div className="text-sm text-text-tertiary">{option.description}</div>
              )}
            </div>
          </div>
        </ModernRadio>
      ))}
    </div>
  )
}
