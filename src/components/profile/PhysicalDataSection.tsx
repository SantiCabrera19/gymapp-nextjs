'use client'

import { Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { Scale, Ruler, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface PhysicalDataSectionProps {
  data: any
  errors: any
  isActive: boolean
  onFocus: () => void
  onBlur: () => void
  onChange: (field: string, value: any) => void
}

export function PhysicalDataSection({
  data,
  errors,
  isActive,
  onFocus,
  onBlur,
  onChange
}: PhysicalDataSectionProps) {
  // Inicializar con la preferencia del usuario
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(
    data.preferred_units === 'imperial' ? 'lbs' : 'kg'
  )
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(
    data.preferred_units === 'imperial' ? 'ft' : 'cm'
  )

  const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs') => {
    if (from === to) return value
    return from === 'kg' ? value * 2.20462 : value / 2.20462
  }

  const convertHeight = (value: number, from: 'cm' | 'ft', to: 'cm' | 'ft') => {
    if (from === to) return value
    return from === 'cm' ? value / 30.48 : value * 30.48
  }

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      onChange('weight_kg', null)
      return
    }
    const kgValue = weightUnit === 'kg' ? numValue : convertWeight(numValue, 'lbs', 'kg')
    onChange('weight_kg', Math.round(kgValue * 10) / 10)
  }

  const handleHeightChange = (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      onChange('height_cm', null)
      return
    }
    const cmValue = heightUnit === 'cm' ? numValue : convertHeight(numValue, 'ft', 'cm')
    onChange('height_cm', Math.round(cmValue))
  }

  const displayWeight = data.weight_kg 
    ? weightUnit === 'kg' 
      ? data.weight_kg 
      : Math.round(convertWeight(data.weight_kg, 'kg', 'lbs') * 10) / 10
    : ''

  const displayHeight = data.height_cm
    ? heightUnit === 'cm'
      ? data.height_cm
      : Math.round(convertHeight(data.height_cm, 'cm', 'ft') * 100) / 100
    : ''

  return (
    <Card className={cn(
      "transition-all duration-200",
      isActive && "ring-2 ring-accent-primary/50 shadow-lg"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent-primary" />
          Datos Físicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight */}
        <div className="relative">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Peso"
                placeholder={weightUnit === 'kg' ? '70' : '154'}
                value={displayWeight}
                onChange={(e) => handleWeightChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                error={errors.weight_kg}
                className="pl-10"
                type="number"
                step="0.1"
              />
              <Scale className="absolute left-3 top-[38px] h-4 w-4 text-text-tertiary" />
            </div>
            <div className="flex rounded-md border border-border-primary overflow-hidden mb-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setWeightUnit('kg')
                }}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  weightUnit === 'kg'
                    ? "bg-accent-primary text-white"
                    : "bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                )}
              >
                kg
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setWeightUnit('lbs')
                }}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  weightUnit === 'lbs'
                    ? "bg-accent-primary text-white"
                    : "bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                )}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Height */}
        <div className="relative">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Altura"
                placeholder={heightUnit === 'cm' ? '175' : '5.74'}
                value={displayHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                error={errors.height_cm}
                className="pl-10"
                type="number"
                step={heightUnit === 'cm' ? '1' : '0.01'}
              />
              <Ruler className="absolute left-3 top-[38px] h-4 w-4 text-text-tertiary" />
            </div>
            <div className="flex rounded-md border border-border-primary overflow-hidden mb-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setHeightUnit('cm')
                }}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  heightUnit === 'cm'
                    ? "bg-accent-primary text-white"
                    : "bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                )}
              >
                cm
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setHeightUnit('ft')
                }}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  heightUnit === 'ft'
                    ? "bg-accent-primary text-white"
                    : "bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                )}
              >
                ft
              </button>
            </div>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="relative">
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={data.date_of_birth || ''}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            error={errors.date_of_birth}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-[38px] h-4 w-4 text-text-tertiary" />
        </div>

        {/* BMI Display */}
        {data.weight_kg && data.height_cm && (
          <div className="p-3 bg-background-tertiary/30 rounded-md">
            <div className="text-sm font-medium text-text-primary">
              IMC: {((data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1))}
            </div>
            <div className="text-xs text-text-tertiary">
              Índice de Masa Corporal calculado automáticamente
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
