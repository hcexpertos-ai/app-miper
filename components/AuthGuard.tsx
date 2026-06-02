'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '../src/store/auth-store'
import { useAppStore }  from '../src/store/app-store'

// Detecta si la app corre en GitHub Pages para usar window.location en vez del router
const isGithubPages = typeof window !== 'undefined' &&
  window.location.hostname.endsWith('.github.io')

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname()
  const user       = useAuthStore(s => s.user)
  const authLoading = useAuthStore(s => s.loading)
  const init       = useAuthStore(s => s.init)
  const inicializar = useAppStore(s => s.inicializar)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      if (pathname !== '/auth') {
        if (isGithubPages) {
          // En GitHub Pages usamos recarga directa para evitar problemas con el router
          const base = window.location.pathname.replace(/\/[^/]*\/?$/, '')
          window.location.replace(base + '/auth/')
        } else {
          window.location.replace('/auth')
        }
      }
      return
    }

    // Usuario autenticado — cargar datos de la app
    if (pathname !== '/auth') {
      inicializar()
    }
  }, [user, authLoading, pathname, inicializar])

  // Splash mientras verifica sesión
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <p className="text-sm text-gray-500">Cargando…</p>
        </div>
      </div>
    )
  }

  // En la página de auth no renderizamos el layout protegido
  if (!user && pathname === '/auth') return <>{children}</>

  // Sin usuario y no en /auth → redirigiendo (no mostrar contenido)
  if (!user) return null

  return <>{children}</>
}
