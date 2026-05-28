import type { Metadata } from 'next'
import './globals.css'
import Navigation  from '@/components/Navigation'
import AuthGuard   from '@/components/AuthGuard'

export const metadata: Metadata = {
  title: 'App MIPER · DS 44',
  description: 'Sistema de gestión de prevención de riesgos — DS 44 · Ley 16.744',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#1e3a5f" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <AuthGuard>
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}
