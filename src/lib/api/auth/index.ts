import { supabase } from '@/lib/supabase'
import type { TablesInsert } from '@/types/database'
import type { 
  SignUpData, 
  SignInData, 
  ProfileCompletionData,
  AuthResponse,
  UserProfile 
} from '@/types/auth'

// =====================================================
// AUTENTICACIÓN BÁSICA
// =====================================================

export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    // 1. Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No user returned from signup')

    // 2. Crear perfil en users table (mínimo indispensable)
    const base = data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || 'user'
    const suffix = Math.random().toString(36).slice(2, 6)
    const username = `${base}_${suffix}`

    const profilePayload: TablesInsert<'users'> = {
      id: authData.user.id,
      email: data.email,
      username,
      full_name: (data as any).full_name ?? null,
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert(profilePayload)

    if (profileError) throw profileError

    return {
      data: authData,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) throw error

    return {
      data: authData,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        }
      }
    })

    if (error) throw error

    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// Función para verificar si la tabla users existe
export async function checkUsersTable(): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection issue:', error.code)
    }
  } catch (error) {
    console.error('Database error')
  }
}

// Función para sincronizar datos de Google con el perfil local
export async function syncGoogleProfile(user: any): Promise<void> {
  try {
    if (!user?.user_metadata) {
      return
    }

    const metadata = user.user_metadata
    const userId = user.id

    // Verificar si el usuario ya existe en la tabla users
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Preparar datos del perfil
    const profileData = {
      id: userId,
      email: user.email,
      full_name: metadata.full_name || metadata.name || null,
      avatar_url: metadata.avatar_url || metadata.picture || null,
      username: existingProfile?.username || generateUsernameFromEmail(user.email),
    }

    if (existingProfile && !fetchError) {
      // Actualizar perfil existente
      const updateData: any = {
        full_name: profileData.full_name,
      }

      // Solo actualizar avatar si no tiene uno personalizado
      // (si es null o si es de Google)
      if (!existingProfile.avatar_url || existingProfile.avatar_url.includes('googleusercontent.com')) {
        updateData.avatar_url = profileData.avatar_url
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (updateError) {
        console.error('Profile update failed')
      }
    } else if (fetchError && fetchError.code === 'PGRST116') {
      // Usuario no existe, crear nuevo perfil
      const { error: insertError } = await supabase
        .from('users')
        .insert(profileData)

      if (insertError && insertError.code !== '23505') {
        // Ignorar error de duplicate key (23505) ya que significa que ya existe
        console.error('Profile creation failed:', insertError.code)
      }
    }
  } catch (error) {
    console.error('Profile sync failed')
  }
}

function generateUsernameFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || 'user'
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}_${suffix}`
}

export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return {
      data: null,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// =====================================================
// GESTIÓN DE PERFIL
// =====================================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // Si el usuario no existe en la tabla users, retornar null
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  } catch (error) {
    return null
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

export async function completeProfile(
  userId: string,
  data: ProfileCompletionData
): Promise<AuthResponse<UserProfile>> {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .update({
        username: data.username,
        date_of_birth: data.date_of_birth || null,
        weight_kg: data.weight_kg || null,
        height_cm: data.height_cm || null,
        experience_level: data.experience_level || 'beginner',
        preferred_units: data.preferred_units || 'metric',
        bio: data.bio || null,
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      data: profile,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// =====================================================
// UTILIDADES
// =====================================================

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    // Si no encuentra nada, el username está disponible
    return error?.code === 'PGRST116' // No rows returned
  } catch (error) {
    return false
  }
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return session
}

// =====================================================
// RECUPERACIÓN / CONTRASEÑA
// =====================================================

export async function resetPasswordEmail(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset` : undefined,
    })
    if (error) throw error
    return { data: null, error: null, success: true }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }
  }
}

export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return { data, error: null, success: true }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }
  }
}
