import type { User, Session } from '@supabase/supabase-js'
import type { Database } from './database'

// Tipos de usuario extendido
export type UserProfile = Database['public']['Tables']['users']['Row']
export type UserProfileInsert = Database['public']['Tables']['users']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['users']['Update']

// Estados de autenticación
export type AuthState = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  profileCompleted: boolean
}

// Métodos de autenticación
export type AuthProvider = 'email' | 'google'

// Datos de registro
export interface AuthError {
  message: string
  status?: number
  code?: string
  details?: Record<string, unknown>
}

// Datos de login
export type SignInData = {
  email: string
  password: string
}

// Datos de registro
export type SignUpData = {
  email: string
  password: string
  full_name?: string
}

// Datos de perfil para completar post-OAuth
export type ProfileCompletionData = {
  username: string
  date_of_birth?: string
  weight_kg?: number
  height_cm?: number
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  preferred_units?: 'metric' | 'imperial'
  bio?: string
}

// Respuestas de API
export type AuthResponse<T = unknown> = {
  data: T | null
  error: string | null
  success: boolean
}

// Eventos de autenticación
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PROFILE_COMPLETED'

// Hook de autenticación
export type UseAuthReturn = {
  // Estado
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  profileCompleted: boolean

  // Acciones
  signUp: (data: SignUpData) => Promise<AuthResponse>
  signIn: (data: SignInData) => Promise<AuthResponse>
  signInWithGoogle: () => Promise<AuthResponse>
  signOut: () => Promise<AuthResponse>
  updateProfile: (data: UserProfileUpdate) => Promise<AuthResponse>
  completeProfile: (data: ProfileCompletionData) => Promise<AuthResponse>

  // Utilidades
  refreshSession: () => Promise<void>
  checkUsername: (username: string) => Promise<boolean>
}
