import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '@/features/auth/api/auth'
import type { UserPublic, UsuarioSesion } from '@/features/auth/types/auth.types'

interface AuthState {
  usuario: UsuarioSesion | null
  
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

const aUsuarioSesion = ({ id, username, full_name, email, role }: UserPublic): UsuarioSesion => ({
  id,
  username,
  full_name,
  email,
  role,
})


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login(username, password)
        const usuario = await authApi.getMe()
        set({ usuario: aUsuarioSesion(usuario), cargando: false })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          
        }
        set({ usuario: null })
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.getMe()
          set({ usuario: aUsuarioSesion(usuario), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
