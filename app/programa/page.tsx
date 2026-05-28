'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/src/store/app-store'
import Modal from '@/components/Modal'
import type { EstadoPrograma, ProgramaTrabajo } from '@/src/types'
import { LABEL_ESTADO, COLOR_ESTADO } from '@/src/types'

// ─── Barra de progreso ────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? 'bg-green-500' :
    pct >= 50 ? 'bg-blue-500'  :
    pct >= 20 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Modal: marcar completado ─────────────────────────────────────────────────

function CompletarModal({ item, onConfirm, onClose }: {
  item: ProgramaTrabajo
  onConfirm: (fecha: string) => Promise<void>
  onClose: () => void
}) {
  const [fecha, setFecha]     = useState(new Date().toISOString().split('T')[0])
  const [guardando, setGuardando] = useState(false)

  async function handleConfirm() {
    if (!fecha) return
    setGuardando(true)
    await onConfirm(fecha)
    setGuardando(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Registra la fecha de ejecución efectiva para:</p>
      <div className="bg-slate-50 rounded-lg p-4 text-sm">
        <div className="font-medium text-slate-800">{item.actividad_medida_control}</div>
        <div className="text-slate-500 text-xs mt-1">Proceso: {item.proceso_nombre}</div>
      </div>
      <div>
        <label className="label">Fecha de Ejecución Efectiva *</label>
        <input type="date" className="input max-w-xs" value={fecha}
          onChange={e => setFecha(e.target.value)} />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={handleConfirm} disabled={!fecha || guardando} className="btn-primary disabled:opacity-60">
          {guardando ? 'Guardando…' : '✓ Marcar Completado'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Modal: editar avance ─────────────────────────────────────────────────────

function EditarModal({ item, onConfirm, onClose }: {
  item: ProgramaTrabajo
  onConfirm: (data: Partial<ProgramaTrabajo>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    responsable:                item.responsable,
    fecha_ejecucion_programada: item.fecha_ejecucion_programada,
    porcentaje_avance:          item.porcentaje_avance,
  })
  const [guardando, setGuardando] = useState(false)

  async function handleConfirm() {
    setGuardando(true)
    await onConfirm(form)
    setGuardando(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4 text-sm">
        <div className="font-medium text-slate-800">{item.actividad_medida_control}</div>
        <div className="text-xs text-slate-500 mt-1">
          Proceso: {item.proceso_nombre} · Centro: {item.centro_trabajo_nombre}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Responsable</label>
          <input className="input" value={form.responsable}
            onChange={e => setForm(s => ({ ...s, responsable: e.target.value }))} />
        </div>
        <div>
          <label className="label">Fecha Programada</label>
          <input type="date" className="input" value={form.fecha_ejecucion_programada}
            onChange={e => setForm(s => ({ ...s, fecha_ejecucion_programada: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="label">% Avance — {form.porcentaje_avance}%</label>
          <input
            type="range" min={0} max={100} step={5}
            className="w-full accent-[#1e3a5f]"
            value={form.porcentaje_avance}
            onChange={e => setForm(s => ({ ...s, porcentaje_avance: +e.target.value }))}
          />
          <ProgressBar pct={form.porcentaje_avance} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={handleConfirm} disabled={guardando} className="btn-primary disabled:opacity-60">
          {guardando ? 'Guardando…' : 'Guardar Cambios'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ProgramaPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const {
    programaTrabajo, marcarCompletado, updatePrograma, recomputarEstados,
    error, limpiarError,
  } = useAppStore()

  const [filtroEstado, setFiltroEstado] = useState<EstadoPrograma | 'todos'>('todos')
  const [completarItem, setCompletarItem] = useState<ProgramaTrabajo | null>(null)
  const [editarItem, setEditarItem]       = useState<ProgramaTrabajo | null>(null)

  useEffect(() => { if (mounted) recomputarEstados() }, [mounted])

  if (!mounted) return <div className="p-6 animate-pulse"><div className="h-8 bg-slate-200 rounded w-64" /></div>

  const total       = programaTrabajo.length
  const completados = programaTrabajo.filter(pt => pt.estado === 'completado').length
  const avancePct   = total > 0 ? Math.round((completados / total) * 100) : 0

  const itemsFiltrados = filtroEstado === 'todos'
    ? programaTrabajo
    : programaTrabajo.filter(pt => pt.estado === filtroEstado)

  const PRIORIDAD: Record<string, number> = { vencido: 0, pendiente: 1, en_proceso: 2, completado: 3 }
  const itemsOrdenados = [...itemsFiltrados].sort(
    (a, b) => PRIORIDAD[a.estado] - PRIORIDAD[b.estado]
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Programa de Trabajo Preventivo</h1>
        <p className="text-sm text-slate-500 mt-0.5">Módulo 3 · Seguimiento de Medidas de Control</p>
      </div>

      {error && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={limpiarError} className="ml-4 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {total === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm">No hay medidas de control registradas aún.</p>
          <p className="text-xs mt-1">
            Agrega medidas de control en el módulo MIPER y se derivarán automáticamente aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Avance General del Programa</span>
              <span className="text-2xl font-black text-[#1e3a5f]">{avancePct}%</span>
            </div>
            <ProgressBar pct={avancePct} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {(['pendiente','en_proceso','completado','vencido'] as const).map(estado => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(s => s === estado ? 'todos' : estado)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium
                               transition-all border-2 ${COLOR_ESTADO[estado]}
                               ${filtroEstado === estado ? 'border-current opacity-100' : 'border-transparent opacity-80'}`}
                >
                  <span>{LABEL_ESTADO[estado]}</span>
                  <span className="text-sm font-black ml-2">
                    {programaTrabajo.filter(pt => pt.estado === estado).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="section-header">
              <h2 className="text-sm font-semibold text-slate-700">
                {filtroEstado === 'todos' ? 'Todas las medidas' : `Filtro: ${LABEL_ESTADO[filtroEstado]}`}
                <span className="ml-2 text-slate-400 font-normal">({itemsOrdenados.length})</span>
              </h2>
              {filtroEstado !== 'todos' && (
                <button onClick={() => setFiltroEstado('todos')} className="btn-secondary text-xs">
                  Limpiar filtro
                </button>
              )}
            </div>

            {itemsOrdenados.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No hay items con este filtro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#1e3a5f]">
                    <tr>
                      {['N°','Proceso','Centro de Trabajo','Medida de Control','Responsable',
                        'F. Programada','F. Efectiva','Avance','Estado','Acciones'].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemsOrdenados.map(item => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 ${
                          item.estado === 'vencido'   ? 'bg-red-50/50'     :
                          item.estado === 'completado'? 'bg-green-50/30'   : ''
                        }`}
                      >
                        <td className="table-td font-mono text-slate-400 text-xs">{item.numero_programa}</td>
                        <td className="table-td font-medium max-w-[120px]">{item.proceso_nombre}</td>
                        <td className="table-td text-slate-500 max-w-[120px]">{item.centro_trabajo_nombre}</td>
                        <td className="table-td max-w-[180px] text-xs">{item.actividad_medida_control}</td>
                        <td className="table-td text-xs">{item.responsable}</td>
                        <td className="table-td text-xs whitespace-nowrap">
                          {item.fecha_ejecucion_programada || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="table-td text-xs whitespace-nowrap">
                          {item.fecha_ejecucion_efectiva
                            ? <span className="text-green-700 font-medium">{item.fecha_ejecucion_efectiva}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="table-td min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-[#1e3a5f]"
                                style={{ width: `${item.porcentaje_avance}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold w-8 text-right">
                              {item.porcentaje_avance}%
                            </span>
                          </div>
                        </td>
                        <td className="table-td whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${COLOR_ESTADO[item.estado]}`}>
                            {LABEL_ESTADO[item.estado]}
                          </span>
                        </td>
                        <td className="table-td whitespace-nowrap">
                          <div className="flex gap-1">
                            {item.estado !== 'completado' && (
                              <button
                                onClick={() => setCompletarItem(item)}
                                className="btn-primary text-xs px-2 py-1"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={() => setEditarItem(item)}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {completarItem && (
        <Modal title="Marcar como Completado" onClose={() => setCompletarItem(null)} size="md">
          <CompletarModal
            item={completarItem}
            onConfirm={async (fecha) => {
              await marcarCompletado(completarItem.id, fecha)
              setCompletarItem(null)
            }}
            onClose={() => setCompletarItem(null)}
          />
        </Modal>
      )}

      {editarItem && (
        <Modal title="Editar Item del Programa" onClose={() => setEditarItem(null)} size="md">
          <EditarModal
            item={editarItem}
            onConfirm={async (data) => {
              await updatePrograma(editarItem.id, data)
              setEditarItem(null)
            }}
            onClose={() => setEditarItem(null)}
          />
        </Modal>
      )}
    </div>
  )
}
