'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../src/store/auth-store'
import { useAppStore }  from '../src/store/app-store'

const NAV = [
  { href: '/',                icon: '📊', label: 'Dashboard'       },
  { href: '/autoevaluacion',  icon: '✅', label: 'Eval. Legal'     },
  { href: '/levantamiento',   icon: '📋', label: 'Levantamiento'   },
  { href: '/miper',           icon: '⚠️',  label: 'MIPER'           },
  { href: '/programa',        icon: '📅', label: 'Prog. de Trabajo' },
  { href: '/irl',             icon: '🔔', label: 'IRL'              },
  { href: '/pts',             icon: '📋', label: 'PTS'              },
  { href: '/plan-respuesta',  icon: '🚨', label: 'P.R. Emergencias'  },
  { href: '/fuf',             icon: '🔍', label: 'FUF DS44'         },
  { href: '/informes',        icon: '📄', label: 'Informes'        },
  { href: '/empresas',        icon: '🏢', label: 'Mis Empresas'    },
]

export default function Navigation() {
  const path    = usePathname()
  const router  = useRouter()
  const user    = useAuthStore(s => s.user)
  const signOut = useAuthStore(s => s.signOut)

  const empresa      = useAppStore(s => s.empresa)
  const empresas     = useAppStore(s => s.empresas)
  const switchEmpresa = useAppStore(s => s.switchEmpresa)
  const cargando     = useAppStore(s => s.cargando)

  const [showSelector, setShowSelector] = useState(false)

  // No mostrar navegación en la pantalla de autenticación
  if (path === '/auth') return null

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth')
  }

  return (
    <>
      {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 bg-[#1e3a5f] text-white flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/20">
          <Image src="/logo.png" alt="PRSO Logo" width={160} height={80} className="object-contain w-full h-auto mb-2" priority />
          <div className="text-base font-bold tracking-tight">SGSST-DS44</div>
          <div className="text-[11px] text-white/50">DS 44 · Ley 16.744</div>
        </div>

        {/* Selector de empresa activa */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <button
              onClick={() => setShowSelector(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-left transition-colors"
            >
              <span className="text-sm">🏢</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate leading-tight">
                  {empresa?.razon_social ?? 'Sin empresa'}
                </p>
                {empresas.length > 1 && (
                  <p className="text-[9px] text-white/40 leading-tight">{empresas.length} empresas · click para cambiar</p>
                )}
              </div>
              {empresas.length > 1 && <span className="text-white/40 text-xs">{showSelector ? '▴' : '▾'}</span>}
            </button>

            {/* Dropdown empresas */}
            {showSelector && empresas.length > 1 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#16304f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {empresas.map(emp => (
                  <button
                    key={emp.id}
                    onClick={async () => {
                      setShowSelector(false)
                      if (emp.id !== empresa?.id) await switchEmpresa(emp.id)
                    }}
                    disabled={cargando}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/10 transition-colors text-sm border-b border-white/5 last:border-0 ${
                      emp.id === empresa?.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${emp.id === empresa?.id ? 'bg-green-400' : 'bg-white/20'}`} />
                    <span className="text-white/90 text-[11px] truncate">{emp.razon_social}</span>
                    {emp.id === empresa?.id && <span className="ml-auto text-green-400 text-[10px]">✓</span>}
                  </button>
                ))}
                <Link
                  href="/empresas"
                  onClick={() => setShowSelector(false)}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors border-t border-white/10"
                >
                  <span>⚙️</span> Gestionar empresas
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                path === href
                  ? 'bg-white/20 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Usuario + cerrar sesión */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          {user && (
            <p className="text-[11px] text-white/40 truncate px-1">{user.email}</p>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/65
                       hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>🚪</span> Cerrar sesión
          </button>
          <p className="text-[10px] text-white/25 px-1">Rev. 01 · 2026 · DS 44</p>
        </div>
      </aside>

      {/* ── Bottom nav móvil ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1e3a5f] text-white flex z-50
                      border-t border-white/10 safe-area-inset-bottom">
        {NAV.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
              path === href ? 'text-white' : 'text-white/55'
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex-1 flex flex-col items-center gap-0.5 py-3 text-white/55"
        >
          <span className="text-xl leading-none">🚪</span>
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </>
  )
}
