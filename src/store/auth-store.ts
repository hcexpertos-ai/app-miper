'use client'

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user:    User | null
  loading: boolean
  error:   string | null

  init:     () => Promise<void>
  signIn:   (email: string, password: string) => Promise<void>
  signUp:   (email: string, password: string) => Promise<void>
  signOut:  () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user:    null,
  loading: true,
  error:   null,

  init: async () => {
    // Obtener sesión con timeout de 6s para no quedar colgado si el refresh falla
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        ),
      ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>

      set({ user: result.data.session?.user ?? null, loading: false })
    } catch {
      // Timeout o error — limpiar sesión y mostrar login (sin await para no bloquear)
      set({ user: null, loading: false })
      supabase.auth.signOut().catch(() => {})
    }

    // Escuchar cambios de sesión (login/logout desde otra pestaña o dispositivo)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ loading: false, error: error.message })
      throw error
    }
    set({ user: data.user, loading: false })
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ loading: false, error: error.message })
      throw error
    }
    set({ user: data.user, loading: false })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
