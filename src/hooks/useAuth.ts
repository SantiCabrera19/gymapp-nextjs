'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getCurrentSession, getUserProfile, syncGoogleProfile } from '@/lib/api/auth'
import type { Tables } from '@/types/database'

export interface AuthState {
  user: User | null
  profile: Tables<'users'> | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  updateProfile: (updatedProfile: Partial<Tables<'users'>>) => void
}

// Estado global para sincronizar entre todas las instancias
let globalAuthState: AuthState | null = null
let listeners: Set<(state: AuthState) => void> = new Set()

// Función helper para crear estado completo
const createAuthState = (partial: Partial<AuthState>): AuthState => {
  const updateProfile = (updatedProfile: Partial<Tables<'users'>>) => {
    if (globalAuthState?.profile) {
      updateGlobalState({
        profile: { ...globalAuthState.profile, ...updatedProfile }
      })
    }
  }

  return {
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    updateProfile,
    ...partial,
  }
}

// Función para actualizar estado global y notificar a todos los listeners
const updateGlobalState = (newState: Partial<AuthState>) => {
  const fullState = createAuthState(newState)
  globalAuthState = fullState
  listeners.forEach(listener => listener(fullState))
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() => {
    // Si ya hay estado global, usarlo
    if (globalAuthState) {
      return globalAuthState
    }
    // Estado inicial
    return {
      user: null,
      profile: null,
      session: null,
      loading: true,
      isAuthenticated: false,
      updateProfile: () => {},
    }
  })

  // Registrar listener para sincronización
  useEffect(() => {
    listeners.add(setState)
    
    // Si ya hay estado global, sincronizar inmediatamente
    if (globalAuthState) {
      setState(globalAuthState)
    }

    return () => {
      listeners.delete(setState)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Solo ejecutar la inicialización una vez globalmente
    if (globalAuthState) {
      return
    }

    const getInitialSession = async () => {
      try {
        const session = await getCurrentSession()
        
        if (!mounted) return
        
        if (session?.user) {
          // Si es usuario de Google, sincronizar datos
          if (session.user.app_metadata?.provider === 'google') {
            await syncGoogleProfile(session.user)
          }
          
          // Intentar obtener el perfil, con reintento si es necesario
          let profile = await getUserProfile(session.user.id)
          
          // Si no hay perfil y es usuario de Google, intentar sincronizar de nuevo
          if (!profile && session.user.app_metadata?.provider === 'google') {
            await syncGoogleProfile(session.user)
            profile = await getUserProfile(session.user.id)
          }
          
          
          if (mounted) {
            updateGlobalState({
              user: session.user,
              profile,
              session,
              loading: false,
              isAuthenticated: true,
            })
          }
        } else {
          if (mounted) {
            updateGlobalState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              isAuthenticated: false,
            })
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          updateGlobalState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          })
        }
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Mantener loading durante la sincronización
          updateGlobalState({ loading: true })
          
          // Si es login con Google, sincronizar datos
          if (session.user.app_metadata?.provider === 'google') {
            await syncGoogleProfile(session.user)
          }
          
          // Intentar obtener el perfil, con reintento si es necesario
          let profile = await getUserProfile(session.user.id)
          
          // Si no hay perfil y es usuario de Google, intentar sincronizar de nuevo
          if (!profile && session.user.app_metadata?.provider === 'google') {
            await syncGoogleProfile(session.user)
            profile = await getUserProfile(session.user.id)
          }
          
          updateGlobalState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
          })
        } else if (event === 'SIGNED_OUT') {
          updateGlobalState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          updateGlobalState({
            session,
            user: session.user,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const updateProfile = (updatedProfile: Partial<Tables<'users'>>) => {
    if (globalAuthState?.profile) {
      updateGlobalState({
        profile: { ...globalAuthState.profile, ...updatedProfile }
      })
    }
  }

  return { ...state, updateProfile }
}
