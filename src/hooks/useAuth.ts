'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentSession, getUserProfile, syncGoogleProfile } from '@/lib/api/auth'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '@/types/database'

export interface AuthState {
  user: User | null
  profile: Tables<'users'> | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const session = await getCurrentSession()
        
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
          
          // Pequeña pausa para mostrar el loading state
          await new Promise(resolve => setTimeout(resolve, 400))
          
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          isAuthenticated: false,
        })
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Mantener loading durante la sincronización
          setState(prev => ({ ...prev, loading: true }))
          
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
          
          // Pequeña pausa para mostrar el loading state
          await new Promise(resolve => setTimeout(resolve, 500))
          
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
          }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}
