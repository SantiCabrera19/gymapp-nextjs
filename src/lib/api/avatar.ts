'use client'

import { supabase } from '@/lib/supabase'

export interface UploadAvatarResult {
  success: boolean
  url?: string
  error?: string
}

export interface DeleteAvatarResult {
  success: boolean
  error?: string
}

/**
 * Sube un archivo de avatar a Supabase Storage
 */
export async function uploadAvatar(file: File, userId: string): Promise<UploadAvatarResult> {
  try {
    // Validar archivo
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen' }
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return { success: false, error: 'El archivo es muy grande. Máximo 5MB.' }
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = fileName

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      console.error('Error uploading avatar:', error)
      return { success: false, error: 'Error al subir la imagen' }
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Error in uploadAvatar:', error)
    return { success: false, error: 'Error inesperado al subir la imagen' }
  }
}

/**
 * Elimina un avatar del Storage
 */
export async function deleteAvatar(avatarUrl: string): Promise<DeleteAvatarResult> {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const filePath = fileName // Sin prefijo 'avatars/'

    // Eliminar archivo del Storage
    const { error } = await supabase.storage.from('avatars').remove([filePath])

    if (error) {
      console.error('Error deleting avatar:', error)
      return { success: false, error: 'Error al eliminar la imagen' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteAvatar:', error)
    return { success: false, error: 'Error inesperado al eliminar la imagen' }
  }
}

/**
 * Actualiza el avatar del usuario en la base de datos
 */
export async function updateUserAvatar(
  userId: string,
  avatarUrl: string | null
): Promise<UploadAvatarResult> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error updating user avatar:', error)
      return { success: false, error: 'Error al actualizar el perfil' }
    }

    return { success: true, url: avatarUrl || undefined }
  } catch (error) {
    console.error('Error in updateUserAvatar:', error)
    return { success: false, error: 'Error inesperado al actualizar el perfil' }
  }
}

/**
 * Proceso completo: subir nueva imagen y actualizar perfil
 */
export async function changeUserAvatar(
  file: File,
  userId: string,
  currentAvatarUrl?: string
): Promise<UploadAvatarResult> {
  try {
    // 1. Subir nueva imagen
    const uploadResult = await uploadAvatar(file, userId)
    if (!uploadResult.success || !uploadResult.url) {
      return uploadResult
    }

    // 2. Actualizar base de datos
    const updateResult = await updateUserAvatar(userId, uploadResult.url)
    if (!updateResult.success) {
      // Si falla la actualización, eliminar la imagen subida
      await deleteAvatar(uploadResult.url)
      return updateResult
    }

    // 3. Eliminar imagen anterior (si existe y no es de Google)
    if (currentAvatarUrl && !currentAvatarUrl.includes('googleusercontent.com')) {
      await deleteAvatar(currentAvatarUrl)
    }

    return { success: true, url: uploadResult.url }
  } catch (error) {
    console.error('Error in changeUserAvatar:', error)
    return { success: false, error: 'Error inesperado al cambiar la imagen' }
  }
}

/**
 * Eliminar avatar actual y resetear a null
 */
export async function removeUserAvatar(
  userId: string,
  currentAvatarUrl?: string
): Promise<DeleteAvatarResult> {
  try {
    // 1. Actualizar base de datos primero
    const updateResult = await updateUserAvatar(userId, null)

    if (!updateResult.success) {
      return { success: false, error: updateResult.error }
    }

    // 2. Eliminar imagen del storage (si no es de Google)
    if (currentAvatarUrl && !currentAvatarUrl.includes('googleusercontent.com')) {
      await deleteAvatar(currentAvatarUrl)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in removeUserAvatar:', error)
    return { success: false, error: 'Error inesperado al eliminar la imagen' }
  }
}
