'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/src/store/app-store'
import { calcularStats } from '@/src/lib/risk-engine'
import RiesgoBadge from '@/components/RiesgoBadge'
import type { ClasificacionRiesgo } from '@/src/types'
import { COLOR_ESTADO, LABEL_ESTADO } from '@/src/types'

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function KPICard({ label, value, icon, sub }: {
  label: string; value: string | number; icon: string; sub?: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

function RiskBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="text-5xl mb-4">🛡️</div>
      <h2 className="text-lg font-semibold text-slate-700 mb-2">
        Bienvenido a App MIPER
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        Comienza configurando tu empresa y centro de trabajo en el módulo de Levantamiento de Procesos.
      </p>
      <Link href="/levantamiento" className="btn-primary">
        Ir a Levantamiento →
      </Link>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { empresa, centro, procesos, tareas, miperRegistros, programaTrabajo } = useAppStore()

  if (!mounted) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const stats = calcularStats(miperRegistros)

  const completados = programaTrabajo.filter(pt => pt.estado === 'completado').length
  const avancePct   = programaTrabajo.length > 0
    ? Math.round((completados / programaTrabajo.length) * 100) : 0

  const criticos = miperRegistros
    .filter(m => m.clasificacion_riesgo === 'importante' || m.clasificacion_riesgo === 'intolerable')
    .sort((a, b) => b.mr - a.mr)
    .slice(0, 6)

  if (!empresa) return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Sistema de Gestión Preventiva · DS 44</p>
      </div>
      <EmptyState />
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {empresa.razon_social} · {centro?.nombre ?? '—'} · RUT {empresa.rut}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          icon="📋" label="Procesos" value={procesos.length}
          sub={`${tareas.length} tareas`}
        />
        <KPICard
          icon="⚠️" label="Riesgos MIPER" value={stats.total}
          sub={`${stats.pct_controlados}% controlados`}
        />
        <KPICard
          icon="🔴" label="Críticos"
          value={stats.importante + stats.intolerable}
          sub={`imp. ${stats.importante} · intol. ${stats.intolerable}`}
        />
        <KPICard
          icon="📅" label="Avance Programa" value={`${avancePct}%`}
          sub={`${completados} / ${programaTrabajo.length} medidas`}
        />
      </div>

      {/* Fila media */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Distribución de riesgos */}
        <div className="card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-slate-700">Distribución de Riesgos</h2>
            <span className="text-xs text-slate-400">{stats.total} total</span>
          </div>
          <div className="p-5 space-y-3">
            {stats.total === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin registros aún</p>
            ) : (
              <>
                <RiskBar label="Intolerable" value={stats.intolerable} total={stats.total} color="bg-red-500" />
                <RiskBar label="Importante"  value={stats.importante}  total={stats.total} color="bg-orange-400" />
                <RiskBar label="Moderado"    value={stats.moderado}    total={stats.total} color="bg-yellow-400" />
                <RiskBar label="Tolerable"   value={stats.tolerable}   total={stats.total} color="bg-green-500" />
              </>
            )}
          </div>
        </div>

        {/* Avance Programa */}
        <div className="card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-slate-700">Programa de Trabajo</h2>
            <Link href="/programa" className="text-xs text-blue-600 hover:underline">Ver todo →</Link>
          </div>
          <div className="p-5 space-y-4">
            {/* Barra general */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Avance general</span>
                <span className="font-semibold">{avancePct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-[#1e3a5f] transition-all"
                  style={{ width: `${avancePct}%` }}
                />
              </div>
            </div>
            {/* Resumen por estado */}
            <div className="grid grid-cols-2 gap-2">
              {(['pendiente','en_proceso','completado','vencido'] as const).map(estado => (
                <div key={estado} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${COLOR_ESTADO[estado]}`}>
                  <span className="text-xs font-medium">{LABEL_ESTADO[estado]}</span>
                  <span className="ml-auto text-sm font-bold">
                    {programaTrabajo.filter(pt => pt.estado === estado).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Riesgos críticos */}
      {criticos.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-slate-700">Riesgos Críticos</h2>
            <Link href="/miper" className="text-xs text-blue-600 hover:underline">Ver MIPER →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e3a5f]">
                <tr>
                  {['Peligro','Riesgo','Nivel','Medida de Control','Controlado'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticos.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{m.peligro}</td>
                    <td className="table-td text-slate-500">{m.riesgo}</td>
                    <td className="table-td">
                      <RiesgoBadge clasificacion={m.clasificacion_riesgo as ClasificacionRiesgo} mr={m.mr} size="sm" />
                    </td>
                    <td className="table-td">{m.medida_control || <span className="text-slate-300">—</span>}</td>
                    <td className="table-td">
                      <span className={`inline-block w-3 h-3 rounded-full ${m.esta_controlado ? 'bg-green-500' : 'bg-red-400'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
