'use client'

import { Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { User, Mail, AtSign, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PersonalInfoSectionProps {
  data: any
  errors: any
  isActive: boolean
  onFocus: () => void
  onBlur: () => void
  onChange: (field: string, value: any) => void
}

export function PersonalInfoSection({
  data,
  errors,
  isActive,
  onFocus,
  onBlur,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isActive && 'ring-2 ring-accent-primary/50 shadow-lg'
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-accent-primary" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <Input
            label="Nombre completo"
            placeholder="Tu nombre completo"
            value={data.full_name || ''}
            onChange={e => onChange('full_name', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            error={errors.full_name}
            className="pl-10"
          />
          <User className="absolute left-3 top-[38px] h-4 w-4 text-text-tertiary" />
        </div>

        {/* Username */}
        <div className="relative">
          <Input
            label="Nombre de usuario"
            placeholder="usuario_unico"
            value={data.username || ''}
            onChange={e =>
              onChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }
            onFocus={onFocus}
            onBlur={onBlur}
            error={errors.username}
            className="pl-10"
          />
          <AtSign className="absolute left-3 top-[38px] h-4 w-4 text-text-tertiary" />
        </div>

        {/* Email (readonly) */}
        <div className="relative">
          <Input label="Email" value={data.email || ''} disabled className="pl-10 opacity-60" />
          <Mail className="absolute left-3 top-[38px] h-4 w-4 text-text-tertiary" />
          <div className="text-xs text-text-tertiary mt-1">El email no se puede cambiar</div>
        </div>

        {/* Bio */}
        <div className="relative">
          <label className="block text-sm font-medium text-text-primary mb-2">Biografía</label>
          <div className="relative">
            <textarea
              placeholder="Cuéntanos sobre ti y tus objetivos fitness..."
              value={data.bio || ''}
              onChange={e => onChange('bio', e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              rows={3}
              maxLength={200}
              className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-border-primary rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
            />
            <FileText className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
          </div>
          <div className="text-xs text-text-tertiary mt-1 text-right">
            {(data.bio || '').length}/200 caracteres
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
