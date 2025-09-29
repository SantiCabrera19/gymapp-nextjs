'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ModernRadioGroup } from '@/components/ui/ModernRadio'
import { Settings, Globe, Dumbbell, User, Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreferencesSectionProps {
  data: any
  errors: any
  isActive: boolean
  onFocus: () => void
  onBlur: () => void
  onChange: (field: string, value: any) => void
}

const experienceLevels = [
  {
    value: 'beginner',
    label: 'Principiante',
    description: 'Menos de 6 meses',
    icon: <User className="h-5 w-5" />,
  },
  {
    value: 'intermediate',
    label: 'Intermedio',
    description: '6 meses - 2 años',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    value: 'advanced',
    label: 'Avanzado',
    description: 'Más de 2 años',
    icon: <Trophy className="h-5 w-5" />,
  },
]

const unitSystems = [
  {
    value: 'metric',
    label: 'Métrico',
    description: 'kg, cm, km',
    icon: <div className="text-xs font-mono bg-accent-primary/20 px-2 py-1 rounded">KG</div>,
  },
  {
    value: 'imperial',
    label: 'Imperial',
    description: 'lbs, ft, miles',
    icon: <div className="text-xs font-mono bg-accent-primary/20 px-2 py-1 rounded">LB</div>,
  },
]

const timezones = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
]

export function PreferencesSection({
  data,
  errors,
  isActive,
  onFocus,
  onBlur,
  onChange,
}: PreferencesSectionProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isActive && 'ring-2 ring-accent-primary/50 shadow-lg'
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent-primary" />
          Preferencias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <div onFocus={onFocus} onBlur={onBlur}>
          <label className="block text-sm font-medium text-text-primary mb-3">
            <Dumbbell className="inline h-4 w-4 mr-2" />
            Nivel de experiencia
          </label>
          <ModernRadioGroup
            name="experience_level"
            value={data.experience_level || 'beginner'}
            onChange={value => onChange('experience_level', value)}
            options={experienceLevels}
          />
        </div>

        {/* Unit System */}
        <div onFocus={onFocus} onBlur={onBlur}>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Sistema de unidades
          </label>
          <ModernRadioGroup
            name="preferred_units"
            value={data.preferred_units || 'metric'}
            onChange={value => onChange('preferred_units', value)}
            options={unitSystems}
            className="grid gap-3 sm:grid-cols-2"
          />
        </div>

        {/* Timezone */}
        <div onFocus={onFocus} onBlur={onBlur}>
          <label className="block text-sm font-medium text-text-primary mb-3">
            <Globe className="inline h-4 w-4 mr-2" />
            Zona horaria
          </label>
          <select
            value={data.timezone || ''}
            onChange={e => onChange('timezone', e.target.value)}
            className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent appearance-none cursor-pointer hover:border-accent-primary/50 transition-colors"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            {timezones.map(tz => (
              <option
                key={tz.value}
                value={tz.value}
                className="bg-background-secondary text-text-primary py-2"
              >
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
