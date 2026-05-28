'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/src/store/app-store'
import Modal from '@/components/Modal'
import type { Empresa, CentroTrabajo, Proceso, Tarea, TipoProceso } from '@/src/types'
import { LABEL_TIPO_PROCESO } from '@/src/types'

// ─── Formularios ─────────────────────────────────────────────────────────────

function EmpresaForm({ onSave }: { onSave: () => void }) {
  const { empresa, centro, guardarEmpresa, guardarCentro } = useAppStore()

  const [emp, setEmp] = useState<Omit<Empresa,'id'>>({
    razon_social:        empresa?.razon_social ?? '',
    rut:                 empresa?.rut ?? '',
    actividad_economica: empresa?.actividad_economica ?? '',
    comuna:              empresa?.comuna ?? '',
  })
  const [ctr, setCtr] = useState<Omit<CentroTrabajo,'id'|'empresa_id'>>({
    nombre:                 centro?.nombre ?? '',
    direccion:              centro?.direccion ?? '',
    n_trabajadores_hombres: centro?.n_trabajadores_hombres ?? 0,
    n_trabajadores_mujeres: centro?.n_trabajadores_mujeres ?? 0,
    n_trabajadores_otro:    centro?.n_trabajadores_otro ?? 0,
  })
  const [guardando, setGuardando] = useState(false)
  const [err, setErr] = useState('')

  async function handleSave() {
    if (!emp.razon_social || !emp.rut || !ctr.nombre) return
    setGuardando(true)
    setErr('')
    try {
      const empData = empresa?.id
        ? { id: empresa.id, ...emp }
        : emp
      await guardarEmpresa(empData)

      const empId = empresa?.id ?? (useAppStore.getState().empresa?.id ?? '')
      const ctrData = centro?.id
        ? { id: centro.id, empresa_id: empId, ...ctr }
        : { empresa_id: empId, ...ctr }
      await guardarCentro(ctrData)
      onSave()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Empresa */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          Datos de la Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Razón Social *</label>
            <input className="input" value={emp.razon_social}
              onChange={e => setEmp(s => ({ ...s, razon_social: e.target.value }))} />
          </div>
          <div>
            <label className="label">RUT *</label>
            <input className="input" placeholder="12.345.678-9" value={emp.rut}
              onChange={e => setEmp(s => ({ ...s, rut: e.target.value }))} />
          </div>
          <div>
            <label className="label">Actividad Económica</label>
            <input className="input" value={emp.actividad_economica}
              onChange={e => setEmp(s => ({ ...s, actividad_economica: e.target.value }))} />
          </div>
          <div>
            <label className="label">Comuna</label>
            <input className="input" value={emp.comuna}
              onChange={e => setEmp(s => ({ ...s, comuna: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Centro de Trabajo */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          Centro de Trabajo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre del Centro *</label>
            <input className="input" value={ctr.nombre}
              onChange={e => setCtr(s => ({ ...s, nombre: e.target.value }))} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" value={ctr.direccion}
              onChange={e => setCtr(s => ({ ...s, direccion: e.target.value }))} />
          </div>
          <div>
            <label className="label">Trabajadores Hombres</label>
            <input type="number" min={0} className="input" value={ctr.n_trabajadores_hombres}
              onChange={e => setCtr(s => ({ ...s, n_trabajadores_hombres: +e.target.value }))} />
          </div>
          <div>
            <label className="label">Trabajadoras Mujeres</label>
            <input type="number" min={0} className="input" value={ctr.n_trabajadores_mujeres}
              onChange={e => setCtr(s => ({ ...s, n_trabajadores_mujeres: +e.target.value }))} />
          </div>
          <div>
            <label className="label">Otro género</label>
            <input type="number" min={0} className="input" value={ctr.n_trabajadores_otro}
              onChange={e => setCtr(s => ({ ...s, n_trabajadores_otro: +e.target.value }))} />
          </div>
        </div>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!emp.razon_social || !emp.rut || !ctr.nombre || guardando}
          className="btn-primary disabled:opacity-60"
        >
          {guardando ? 'Guardando…' : 'Guardar Empresa y Centro'}
        </button>
      </div>
    </div>
  )
}

function ProcesoForm({
  initial, centroId, onClose,
}: {
  initial?: Proceso; centroId: string; onClose: () => void
}) {
  const { addProceso, updateProceso } = useAppStore()
  const [form, setForm] = useState({
    nombre:                    initial?.nombre ?? '',
    tipo:                      (initial?.tipo ?? 'operacional') as TipoProceso,
    responsable_levantamiento: initial?.responsable_levantamiento ?? '',
    fecha_levantamiento:       initial?.fecha_levantamiento ?? new Date().toISOString().split('T')[0],
    centro_trabajo_id:         centroId,
  })
  const [err, setErr]         = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleSave() {
    if (!form.nombre.trim()) { setErr('El nombre del proceso es obligatorio.'); return }
    setGuardando(true)
    setErr('')
    try {
      if (initial) await updateProceso(initial.id, form)
      else await addProceso({ ...form, centro_trabajo_id: centroId })
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Nombre del Proceso *</label>
          <input className="input" placeholder="Ej: Producción de pan"
            value={form.nombre} onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} />
        </div>
        <div>
          <label className="label">Tipo de Proceso *</label>
          <select className="select" value={form.tipo}
            onChange={e => setForm(s => ({ ...s, tipo: e.target.value as TipoProceso }))}>
            <option value="operacional">Operacional</option>
            <option value="apoyo">Apoyo</option>
          </select>
        </div>
        <div>
          <label className="label">Fecha Levantamiento</label>
          <input type="date" className="input" value={form.fecha_levantamiento}
            onChange={e => setForm(s => ({ ...s, fecha_levantamiento: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Responsable del Levantamiento</label>
          <input className="input" placeholder="Nombre del responsable"
            value={form.responsable_levantamiento}
            onChange={e => setForm(s => ({ ...s, responsable_levantamiento: e.target.value }))} />
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={guardando} className="btn-primary disabled:opacity-60">
          {guardando ? 'Guardando…' : initial ? 'Actualizar' : 'Agregar Proceso'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

function TareaForm({
  procesoId, initial, onClose,
}: {
  procesoId: string; initial?: Tarea; onClose: () => void
}) {
  const { addTarea, updateTarea } = useAppStore()
  const [form, setForm] = useState({
    actividad:              initial?.actividad ?? '',
    descripcion_tarea:      initial?.descripcion_tarea ?? '',
    puesto_trabajo:         initial?.puesto_trabajo ?? '',
    lugar_ejecucion:        initial?.lugar_ejecucion ?? '',
    es_rutinaria:           initial?.es_rutinaria ?? true,
    n_trabajadores_hombres: initial?.n_trabajadores_hombres ?? 0,
    n_trabajadores_mujeres: initial?.n_trabajadores_mujeres ?? 0,
    n_trabajadores_otro:    initial?.n_trabajadores_otro ?? 0,
    equipos_involucrados:   initial?.equipos_involucrados ?? '',
    materiales_sustancias:  initial?.materiales_sustancias ?? '',
    observaciones:          initial?.observaciones ?? '',
    proceso_id:             procesoId,
  })
  const [err, setErr]         = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleSave() {
    if (!form.actividad.trim() || !form.descripcion_tarea.trim() || !form.puesto_trabajo.trim() || !form.lugar_ejecucion.trim()) {
      setErr('Actividad, tarea, puesto y lugar son obligatorios.')
      return
    }
    setGuardando(true)
    setErr('')
    try {
      if (initial) await updateTarea(initial.id, form)
      else await addTarea({ ...form, proceso_id: procesoId })
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* ── Identificación ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          Identificación de la Tarea
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Tarea / Actividad *</label>
            <input className="input" placeholder="Ej: Preparación de masa"
              value={form.actividad} onChange={e => setForm(s => ({ ...s, actividad: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descripción detallada</label>
            <textarea rows={2} className="input resize-none"
              placeholder="Describe los pasos o características de la tarea"
              value={form.descripcion_tarea}
              onChange={e => setForm(s => ({ ...s, descripcion_tarea: e.target.value }))} />
          </div>
          <div>
            <label className="label">Puesto de Trabajo *</label>
            <input className="input" placeholder="Ej: Maestro panadero / Ayudante"
              value={form.puesto_trabajo}
              onChange={e => setForm(s => ({ ...s, puesto_trabajo: e.target.value }))} />
          </div>
          <div>
            <label className="label">Lugar de Ejecución *</label>
            <input className="input" placeholder="Ej: Sala de producción"
              value={form.lugar_ejecucion}
              onChange={e => setForm(s => ({ ...s, lugar_ejecucion: e.target.value }))} />
          </div>
          <div>
            <label className="label">Rutinaria / No Rutinaria</label>
            <select className="select" value={form.es_rutinaria ? 'si' : 'no'}
              onChange={e => setForm(s => ({ ...s, es_rutinaria: e.target.value === 'si' }))}>
              <option value="si">Rutinaria</option>
              <option value="no">No Rutinaria</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Trabajadores expuestos — Identidad Sexogenérica ────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-widest mb-1">
          N° Trabajadores Expuestos
        </p>
        <p className="text-[11px] text-slate-400 mb-3">Identidad Sexogenérica</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">H</span>
                Hombres
              </span>
            </label>
            <input type="number" min={0} className="input text-center text-lg font-semibold"
              value={form.n_trabajadores_hombres}
              onChange={e => setForm(s => ({ ...s, n_trabajadores_hombres: +e.target.value }))} />
          </div>
          <div>
            <label className="label">
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold flex items-center justify-center">M</span>
                Mujeres
              </span>
            </label>
            <input type="number" min={0} className="input text-center text-lg font-semibold"
              value={form.n_trabajadores_mujeres}
              onChange={e => setForm(s => ({ ...s, n_trabajadores_mujeres: +e.target.value }))} />
          </div>
          <div>
            <label className="label">
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center">O</span>
                Otro
              </span>
            </label>
            <input type="number" min={0} className="input text-center text-lg font-semibold"
              value={form.n_trabajadores_otro}
              onChange={e => setForm(s => ({ ...s, n_trabajadores_otro: +e.target.value }))} />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Total: <strong>{form.n_trabajadores_hombres + form.n_trabajadores_mujeres + form.n_trabajadores_otro}</strong> trabajadores expuestos
        </p>
      </div>

      {/* ── Equipos y Materiales ────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          Equipos y Materiales
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Equipos / Herramientas Involucrados</label>
            <input className="input" placeholder="Ej: Amasadora, horno, balanza"
              value={form.equipos_involucrados}
              onChange={e => setForm(s => ({ ...s, equipos_involucrados: e.target.value }))} />
          </div>
          <div>
            <label className="label">Materiales / Sustancias</label>
            <input className="input" placeholder="Ej: Harina de trigo, levadura, sal"
              value={form.materiales_sustancias}
              onChange={e => setForm(s => ({ ...s, materiales_sustancias: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* ── Observaciones (DS 44) ───────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          Observaciones
        </p>
        <textarea rows={2} className="input resize-none"
          placeholder="Ej: Considerar exposición a polvo de harina, posturas forzadas, calor de hornos"
          value={form.observaciones}
          onChange={e => setForm(s => ({ ...s, observaciones: e.target.value }))} />
        <p className="text-[11px] text-slate-400 mt-1">
          Riesgos o factores relevantes a considerar en el levantamiento (aparece en el informe oficial DS 44)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 hidden">
        {/* campos ocultos para compatibilidad */}
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={guardando} className="btn-primary disabled:opacity-60">
          {guardando ? 'Guardando…' : initial ? 'Actualizar' : 'Agregar Tarea'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function LevantamientoPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const {
    empresa, centro, procesos, removeProceso, removeTarea, tareasByProceso,
    cargando, error, limpiarError,
  } = useAppStore()

  const [showEmpresaForm, setShowEmpresaForm] = useState(false)
  const [showProcesoModal, setShowProcesoModal] = useState(false)
  const [showTareaModal, setShowTareaModal]     = useState<string | null>(null)
  const [editProceso, setEditProceso] = useState<Proceso | undefined>()
  const [editTarea, setEditTarea]     = useState<Tarea | undefined>()
  const [expandidos, setExpandidos]   = useState<Set<string>>(new Set())

  if (!mounted) return <div className="p-6 animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-64" /></div>

  const toggleExpand = (id: string) =>
    setExpandidos(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const empresaOk = !!empresa && !!centro

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Levantamiento de Procesos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Módulo 1 · DS 44</p>
        </div>
        {empresaOk && (
          <button
            onClick={() => { setEditProceso(undefined); setShowProcesoModal(true) }}
            className="btn-primary"
          >
            + Nuevo Proceso
          </button>
        )}
      </div>

      {/* Banner error global */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={limpiarError} className="ml-4 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Empresa / Centro setup */}
      <div className="card">
        <div className="section-header">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Empresa y Centro de Trabajo</h2>
            {empresaOk && (
              <p className="text-xs text-slate-400 mt-0.5">
                {empresa.razon_social} · {empresa.rut} · {centro.nombre}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowEmpresaForm(s => !s)}
            className="btn-secondary text-xs"
            disabled={cargando}
          >
            {empresaOk ? 'Editar' : 'Configurar →'}
          </button>
        </div>
        {!empresaOk && !showEmpresaForm && (
          <div className="px-5 py-4 bg-amber-50 border-t border-amber-100 text-sm text-amber-700">
            ⚠️ Configura la empresa y centro de trabajo antes de agregar procesos.
          </div>
        )}
        {showEmpresaForm && (
          <div className="p-5 border-t border-slate-100">
            <EmpresaForm onSave={() => setShowEmpresaForm(false)} />
          </div>
        )}
      </div>

      {/* Lista de Procesos */}
      {empresaOk && procesos.length === 0 && !cargando && (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">No hay procesos registrados.</p>
          <p className="text-xs mt-1">Usa el botón "Nuevo Proceso" para comenzar.</p>
        </div>
      )}

      {empresaOk && procesos.map(proceso => {
        const trs = tareasByProceso(proceso.id)
        const open = expandidos.has(proceso.id)
        return (
          <div key={proceso.id} className="card overflow-hidden">
            <div
              className="section-header cursor-pointer select-none"
              onClick={() => toggleExpand(proceso.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{open ? '▾' : '▸'}</span>
                <div>
                  <span className="font-semibold text-slate-800">{proceso.nombre}</span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    proceso.tipo === 'operacional'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {LABEL_TIPO_PROCESO[proceso.tipo]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-xs text-slate-400">{trs.length} tarea{trs.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => { setEditProceso(proceso); setShowProcesoModal(true) }}
                  className="btn-secondary text-xs px-2 py-1"
                >
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar proceso y todas sus tareas?')) removeProceso(proceso.id) }}
                  className="btn-danger text-xs px-2 py-1"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => { setEditTarea(undefined); setShowTareaModal(proceso.id) }}
                  className="btn-primary text-xs px-2 py-1"
                >
                  + Tarea
                </button>
              </div>
            </div>

            {open && (
              <div className="border-t border-slate-100">
                {trs.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-400">Sin tareas. Agrega la primera.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#1e3a5f]">
                        <tr>
                          <th className="table-th" rowSpan={2}>Puesto de Trabajo</th>
                          <th className="table-th" rowSpan={2}>Tarea</th>
                          <th className="table-th" rowSpan={2}>Rutinaria</th>
                          <th className="table-th" rowSpan={2}>Lugar de Ejecución</th>
                          <th className="table-th text-center" colSpan={3}>N° Trabajadores Expuestos</th>
                          <th className="table-th" rowSpan={2}>Observaciones</th>
                          <th className="table-th" rowSpan={2}>Acciones</th>
                        </tr>
                        <tr>
                          <th className="px-3 py-1.5 text-center text-[10px] font-bold text-white bg-blue-800 whitespace-nowrap">H</th>
                          <th className="px-3 py-1.5 text-center text-[10px] font-bold text-white bg-pink-800 whitespace-nowrap">M</th>
                          <th className="px-3 py-1.5 text-center text-[10px] font-bold text-white bg-purple-800 whitespace-nowrap">Otro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {trs.map(tarea => (
                          <tr key={tarea.id} className="hover:bg-slate-50">
                            <td className="table-td font-medium">{tarea.puesto_trabajo}</td>
                            <td className="table-td font-semibold text-slate-800">{tarea.actividad}</td>
                            <td className="table-td text-center">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                tarea.es_rutinaria ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {tarea.es_rutinaria ? 'Rutinaria' : 'No Rutinaria'}
                              </span>
                            </td>
                            <td className="table-td">{tarea.lugar_ejecucion}</td>
                            <td className="table-td text-center font-bold text-blue-700">{tarea.n_trabajadores_hombres}</td>
                            <td className="table-td text-center font-bold text-pink-700">{tarea.n_trabajadores_mujeres}</td>
                            <td className="table-td text-center font-bold text-purple-700">{tarea.n_trabajadores_otro}</td>
                            <td className="table-td max-w-[180px] text-slate-500">
                              {tarea.observaciones || tarea.equipos_involucrados || '—'}
                            </td>
                            <td className="table-td whitespace-nowrap">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setEditTarea(tarea); setShowTareaModal(proceso.id) }}
                                  className="btn-secondary text-xs px-2 py-1"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => { if (confirm('¿Eliminar tarea?')) removeTarea(tarea.id) }}
                                  className="btn-danger text-xs px-2 py-1"
                                >
                                  ✕
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
            )}
          </div>
        )
      })}

      {/* Modals */}
      {showProcesoModal && centro && (
        <Modal
          title={editProceso ? 'Editar Proceso' : 'Nuevo Proceso'}
          onClose={() => { setShowProcesoModal(false); setEditProceso(undefined) }}
        >
          <ProcesoForm
            initial={editProceso}
            centroId={centro.id}
            onClose={() => { setShowProcesoModal(false); setEditProceso(undefined) }}
          />
        </Modal>
      )}

      {showTareaModal && (
        <Modal
          title={editTarea ? 'Editar Tarea' : 'Nueva Tarea'}
          onClose={() => { setShowTareaModal(null); setEditTarea(undefined) }}
          size="xl"
        >
          <TareaForm
            procesoId={showTareaModal}
            initial={editTarea}
            onClose={() => { setShowTareaModal(null); setEditTarea(undefined) }}
          />
        </Modal>
      )}
    </div>
  )
}
