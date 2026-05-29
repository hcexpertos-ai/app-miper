'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../src/store/auth-store'

export default function AuthPage() {
  const router   = useRouter()
  const signIn   = useAuthStore(s => s.signIn)
  const signUp   = useAuthStore(s => s.signUp)
  const loading  = useAuthStore(s => s.loading)
  const error    = useAuthStore(s => s.error)
  const clearErr = useAuthStore(s => s.clearError)

  const [modo, setModo]         = useState<'login' | 'registro'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [local, setLocal]       = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErr()
    setLocal(null)

    if (modo === 'registro') {
      if (password !== confirm) {
        setLocal('Las contraseñas no coinciden.')
        return
      }
      if (password.length < 6) {
        setLocal('La contraseña debe tener al menos 6 caracteres.')
        return
      }
    }

    try {
      if (modo === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      router.push('/')
    } catch {
      // error ya seteado en auth-store
    }
  }

  const toggleModo = () => {
    setModo(m => m === 'login' ? 'registro' : 'login')
    clearErr()
    setLocal(null)
  }

  const mensajeError = local ?? error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center rounded-2xl mb-4 px-5 py-3"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            <Image src="/logo.png" alt="PRSO Logo" width={150} height={75} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">App MIPER</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de Prevención de Riesgos · DS 44</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          {mensajeError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {mensajeError}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.cl"
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {modo === 'registro' && (
              <div>
                <label className="label">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60"
            >
              {loading
                ? 'Procesando…'
                : modo === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={toggleModo}
              className="font-medium hover:underline"
              style={{ color: '#1e3a5f' }}
            >
              {modo === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {modo === 'registro' && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Tus datos se almacenan de forma segura. Solo tú puedes ver tu información.
          </p>
        )}
      </div>
    </div>
  )
}
