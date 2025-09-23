'use client'

import { useState } from 'react'
import { Camera, Trash2, Upload } from 'lucide-react'
import { Button, Avatar, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { changeUserAvatar, removeUserAvatar } from '@/lib/api/avatar'

import { useToast } from '@/components/ui/Toast'

interface AvatarSectionProps {
  avatar?: string
  name?: string
  onAvatarChange: (url: string | null) => void
}

export function AvatarSection({ avatar, name, onAvatarChange }: AvatarSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    
    try {
      const result = await changeUserAvatar(file, user.id, avatar)
      
      if (result.success && result.url) {
        onAvatarChange(result.url)
        showSuccess('Foto de perfil actualizada correctamente')
      } else {
        showError(result.error || 'Error al cambiar la foto')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      showError('Error inesperado al subir la imagen')
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !avatar) return

    setIsUploading(true)
    
    try {
      const result = await removeUserAvatar(user.id, avatar)
      
      if (result.success) {
        onAvatarChange(null)
        showSuccess('Foto de perfil eliminada')
      } else {
        showError(result.error || 'Error al eliminar la foto')
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      showError('Error inesperado al eliminar la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        {/* Avatar Display */}
        <div className="relative">
          <Avatar
            size="xl"
            src={avatar || undefined}
            alt={name || 'Usuario'}
            fallback={name?.[0] || 'U'}
            className="ring-4 ring-background-tertiary"
          />
          
          {/* Upload Overlay */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="sr-only"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Avatar Info */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-primary">
            {name || 'Usuario'}
          </h3>
          <p className="text-text-secondary mb-4">
            Personaliza tu foto de perfil
          </p>
          
          <div className="flex gap-3">
            <div className="relative">
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  console.log('Button clicked')
                  const input = document.getElementById('avatar-upload') as HTMLInputElement
                  if (input) {
                    console.log('Input found, clicking')
                    input.click()
                  } else {
                    console.log('Input not found')
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Subiendo...' : 'Cambiar foto'}
              </Button>
            </div>
            
            {avatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isUploading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            )}
          </div>
          
          <div className="text-xs text-text-tertiary mt-2">
            JPG, PNG o GIF. Máximo 5MB.
          </div>
        </div>
      </div>
    </Card>
  )
}
