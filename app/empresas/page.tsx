'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/src/store/app-store'
import type { Empresa, CentroTrabajo } from '@/src/types'
import Modal from '@/components/Modal'

// ─── Formulario empresa + centro ──────────────────────────────────────────────

function EmpresaForm({
  initial,
  initialCentro,
  onSave,
  onCancel,
}: {
  initial?:       Partial<Empresa>
  initialCentro?: Partial<CentroTrabajo>
  onSave:         () => void
  onCancel:       () => void
}) {
  const { guardarEmpresa, guardarCentro, empresa: empresaActiva } = useAppStore()

  const [emp, setEmp] = useState({
    razon_social:        initial?.razon_social        ?? '',
    rut:                 initial?.rut                 ?? '',
    actividad_economica: initial?.actividad_economica ?? '',
    comuna:              initial?.comuna               ?? '',
  })
  const [ctr, setCtr] = useState({
    nombre:                 initialCentro?.nombre                 ?? '',
    direccion:              initialCentro?.direccion               ?? '',
    n_trabajadores_hombres: initialCentro?.n_trabajadores_hombres ?? 0,
    n_trabajadores_mujeres: initialCentro?.n_trabajadores_mujeres ?? 0,
    n_trabajadores_otro:    initialCentro?.n_trabajadores_otro    ?? 0,
  })
  const [guardando, setGuardando] = useState(false)
  const [err,       setErr]       = useState('')

  async function handleSave() {
    if (!emp.razon_social.trim() || !emp.rut.trim() || !ctr.nombre.trim()) {
      setErr('Razón social, RUT y nombre del centro son obligatorios.')
      return
    }
    setGuardando(true)
    setErr('')
    try {
      const empData = initial?.id ? { id: initial.id, ...emp } : emp
      await guardarEmpresa(empData)

      const savedEmpId = initial?.id ?? useAppStore.getState().empresa?.id ?? ''
      const ctrData = initialCentro?.id
        ? { id: initialCentro.id, empresa_id: savedEmpId, ...ctr }
        : { empresa_id: savedEmpId, ...ctr }
      await guardarCentro(ctrData)
      onSave()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const isEditing = !!initial?.id

  return (
    <div className="space-y-5">
      {/* Empresa */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          Datos de la Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Razón Social *</label>
            <input className="input" value={emp.razon_social}
              onChange={e => setEmp(s => ({ ...s, razon_social: e.target.value }))} />
          </div>
          <div>
            <label className="label">RUT *</label>
            <input className="input" placeholder="77.123.456-7" value={emp.rut}
              onChange={e => setEmp(s => ({ ...s, rut: e.target.value }))} />
          </div>
          <div>
            <label className="label">Comuna</label>
            <input className="input" value={emp.comuna}
              onChange={e => setEmp(s => ({ ...s, comuna: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Actividad Económica</label>
            <input className="input" value={emp.actividad_economica}
              onChange={e => setEmp(s => ({ ...s, actividad_economica: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Centro de trabajo */}
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
            <label className="label">N° Trabajadores Hombres</label>
            <input type="number" min={0} className="input" value={ctr.n_trabajadores_hombres}
              onChange={e => setCtr(s => ({ ...s, n_trabajadores_hombres: +e.target.value }))} />
          </div>
          <div>
            <label className="label">N° Trabajadores Mujeres</label>
            <input type="number" min={0} className="input" value={ctr.n_trabajadores_mujeres}
              onChange={e => setCtr(s => ({ ...s, n_trabajadores_mujeres: +e.target.value }))} />
          </div>
          <div>
            <label className="label">N° Trabajadores Otro</label>
            <input type="number" min={0} className="input" value={ctr.n_trabajadores_otro}
              onChange={e => setCtr(s => ({ ...s, n_trabajadores_otro: +e.target.value }))} />
          </div>
        </div>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={guardando} className="btn-primary disabled:opacity-60">
          {guardando ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear Empresa'}
        </button>
        <button onClick={onCancel} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function EmpresasPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { empresas, empresa: activa, centro, switchEmpresa, deleteEmpresa, cargando, error, limpiarError } = useAppStore()

  const [showModal,    setShowModal]    = useState(false)
  const [editEmpresa,  setEditEmpresa]  = useState<Empresa | undefined>()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [switching,    setSwitching]    = useState<string | null>(null)

  if (!mounted) return <div className="p-6 animate-pulse"><div className="h-8 bg-slate-200 rounded w-64" /></div>

  async function handleSwitch(id: string) {
    if (id === activa?.id) return
    setSwitching(id)
    await switchEmpresa(id)
    setSwitching(null)
  }

  async function handleDelete(id: string) {
    await deleteEmpresa(id)
    setConfirmDelete(null)
  }

  function openNew() {
    setEditEmpresa(undefined)
    setShowModal(true)
  }

  function openEdit(emp: Empresa) {
    setEditEmpresa(emp)
    setShowModal(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Empresas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Agrega, edita, activa o elimina empresas</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          + Nueva Empresa
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={limpiarError} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Lista de empresas */}
      {empresas.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-3xl mb-2">🏢</p>
          <p className="text-sm">No hay empresas registradas aún.</p>
          <button onClick={openNew} className="mt-4 btn-primary text-sm">+ Crear primera empresa</button>
        </div>
      ) : (
        <div className="space-y-3">
          {empresas.map(emp => {
            const isActiva  = emp.id === activa?.id
            const isLoading = switching === emp.id || (cargando && switching === emp.id)
            return (
              <div
                key={emp.id}
                className={`card p-4 flex items-center gap-4 transition-all ${
                  isActiva ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]/20' : ''
                }`}
              >
                {/* Indicador activo */}
                <div className={`w-3 h-3 rounded-full shrink-0 ${isActiva ? 'bg-green-500' : 'bg-slate-200'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800">{emp.razon_social}</p>
                    {isActiva && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                        ACTIVA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    RUT: {emp.rut}
                    {emp.comuna ? ` · ${emp.comuna}` : ''}
                    {emp.actividad_economica ? ` · ${emp.actividad_economica}` : ''}
                  </p>
                  {isActiva && centro && (
                    <p className="text-xs text-indigo-600 mt-0.5">
                      📍 Centro activo: {centro.nombre}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 shrink-0">
                  {!isActiva && (
                    <button
                      onClick={() => handleSwitch(emp.id)}
                      disabled={!!switching || cargando}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1e3a5f] text-white hover:bg-[#15294a] disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? '⏳ Activando…' : '⚡ Activar'}
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(emp)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(emp.id)}
                    disabled={isActiva && empresas.length === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 disabled:opacity-30 transition-colors"
                    title={isActiva && empresas.length === 1 ? 'No puedes eliminar la única empresa' : ''}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Nueva / Editar empresa */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
        >
          <EmpresaForm
            initial={editEmpresa}
            onSave={() => setShowModal(false)}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {/* Modal: Confirmar eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar empresa?</h2>
            <p className="text-sm text-slate-500 mb-5">
              Esta acción eliminará la empresa y todos sus datos (procesos, tareas, MIPER, etc.). No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 text-sm"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
