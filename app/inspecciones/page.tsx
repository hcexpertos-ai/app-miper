'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/src/store/app-store'
import {
  type InspeccionRegistro, type EstadoInspeccion,
  AREAS_TRABAJO, ESTADO_INSPECCION_LABEL, ESTADO_INSPECCION_COLOR,
} from '@/src/types'
import { generarSugerenciaMiperConIA } from '@/src/lib/ai/miper-ai-service'
import type { ContextoTarea } from '@/src/types/ai'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId(): string {
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}

function fmtFecha(iso: string) {
  if (!iso) return '—'
  return new Date(iso + (iso.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-CL')
}

// ─── Formulario inspección ────────────────────────────────────────────────────

const FORM_DEFAULT = {
  fecha_reporte:         new Date().toISOString().split('T')[0],
  nombre_trabajador:     '',
  area_trabajo:          '',
  ubicacion_descripcion: '',
  estado:                'pendiente' as EstadoInspeccion,
  peligro:               '',
  riesgo:                '',
  consecuencia:          '',
  medida_control:        '',
  normativa:             '',
  responsable:           '',
  fecha_ejecucion:       '',
  observaciones:         '',
}

type FormState = typeof FORM_DEFAULT

function InspeccionForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: InspeccionRegistro
  onSave:  (data: FormState) => void
  onClose: () => void
}) {
  const { empresa, centro } = useAppStore()

  const [form, setForm] = useState<FormState>(() => initial
    ? {
        fecha_reporte:         initial.fecha_reporte,
        nombre_trabajador:     initial.nombre_trabajador,
        area_trabajo:          initial.area_trabajo,
        ubicacion_descripcion: initial.ubicacion_descripcion,
        estado:                initial.estado,
        peligro:               initial.peligro,
        riesgo:                initial.riesgo,
        consecuencia:          initial.consecuencia,
        medida_control:        initial.medida_control,
        normativa:             initial.normativa,
        responsable:           initial.responsable,
        fecha_ejecucion:       initial.fecha_ejecucion ?? '',
        observaciones:         initial.observaciones,
      }
    : FORM_DEFAULT
  )

  const [analizando, setAnalizando] = useState(false)
  const [iaAplicada, setIaAplicada] = useState(false)
  const [err,        setErr]        = useState('')

  const set = (k: keyof FormState, v: string) => setForm(s => ({ ...s, [k]: v }))

  // ── Analizar con IA ─────────────────────────────────────────────────────────
  const handleAnalizar = useCallback(async () => {
    if (!form.area_trabajo && !form.ubicacion_descripcion) {
      setErr('Completa al menos el Área de Trabajo o la descripción de la condición.')
      return
    }
    setAnalizando(true)
    setErr('')
    try {
      const contexto: ContextoTarea = {
        empresa_razon_social:  empresa?.razon_social ?? '',
        empresa_actividad:     empresa?.actividad_economica ?? '',
        centro_nombre:         centro?.nombre ?? '',
        proceso_nombre:        form.area_trabajo,
        proceso_tipo:          'operacional',
        actividad:             form.area_trabajo,
        descripcion_tarea:     form.ubicacion_descripcion || form.area_trabajo,
        puesto_trabajo:        form.nombre_trabajador || 'Inspector',
        lugar_ejecucion:       `${form.area_trabajo}${form.ubicacion_descripcion ? ' — ' + form.ubicacion_descripcion : ''}`,
        equipos_involucrados:  '',
        materiales_sustancias: '',
        n_trabajadores_total:  1,
        es_rutinaria:          false,
      }
      const resultado = await generarSugerenciaMiperConIA(contexto, 'local')
      const sug = resultado.sugerencias[0]
      if (!sug) {
        setErr('No se encontraron sugerencias para esta condición. Intenta con más detalles.')
        return
      }
      const medida = sug.medidasControl[0]
      setForm(s => ({
        ...s,
        peligro:       sug.peligro,
        riesgo:        sug.riesgo,
        consecuencia:  sug.consecuenciaEsperada,
        medida_control: medida?.descripcion ?? '',
        normativa:     sug.normativaRelacionada[0]?.norma ?? '',
      }))
      setIaAplicada(true)
    } catch (e) {
      setErr((e as Error).message ?? 'Error al analizar con IA.')
    } finally {
      setAnalizando(false)
    }
  }, [form.area_trabajo, form.ubicacion_descripcion, form.nombre_trabajador, empresa, centro])

  function handleSave() {
    if (!form.nombre_trabajador.trim() || !form.area_trabajo.trim()) {
      setErr('Nombre del trabajador y área de trabajo son obligatorios.')
      return
    }
    onSave(form)
  }

  return (
    <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

      {/* ── Sección 1: Datos del reporte ── */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          1. Datos del Reporte
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha del Reporte *</label>
            <input type="date" className="input" value={form.fecha_reporte}
              onChange={e => set('fecha_reporte', e.target.value)} />
          </div>
          <div>
            <label className="label">Nombre del Trabajador *</label>
            <input className="input" placeholder="Nombre completo" value={form.nombre_trabajador}
              onChange={e => set('nombre_trabajador', e.target.value)} />
          </div>
          <div>
            <label className="label">Área de Trabajo *</label>
            <select className="select" value={form.area_trabajo}
              onChange={e => set('area_trabajo', e.target.value)}>
              <option value="">— Seleccionar área —</option>
              {AREAS_TRABAJO.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="select" value={form.estado}
              onChange={e => set('estado', e.target.value as EstadoInspeccion)}>
              <option value="pendiente">🔴 Pendiente</option>
              <option value="en_proceso">🟡 En Proceso</option>
              <option value="cerrado">🟢 Cerrado</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Ubicación / Descripción de la Condición Insegura</label>
            <textarea rows={3} className="input resize-none"
              placeholder="Describe dónde está la condición y qué observas exactamente. Ej: Cables eléctricos sueltos en el piso del área de producción junto a la línea 2..."
              value={form.ubicacion_descripcion}
              onChange={e => set('ubicacion_descripcion', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Botón IA ── */}
      <div>
        <button
          type="button"
          onClick={handleAnalizar}
          disabled={analizando}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {analizando
            ? <><span className="animate-spin">⏳</span> Analizando condición con IA…</>
            : <><span>🤖</span> {iaAplicada ? '✅ Análisis IA aplicado — volver a analizar' : 'Analizar condición con IA Preventiva'}</>
          }
        </button>
        {iaAplicada && (
          <p className="text-xs text-green-600 mt-1 text-center">
            ✅ IA completó: peligro, riesgo, consecuencia, medida y normativa. Puedes editarlos.
          </p>
        )}
      </div>

      {/* ── Sección 2: Análisis de riesgo ── */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          2. Análisis de la Condición Insegura
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label">Peligro Identificado</label>
            <input className="input" placeholder="Describe el peligro presente" value={form.peligro}
              onChange={e => set('peligro', e.target.value)} />
          </div>
          <div>
            <label className="label">Riesgo Asociado</label>
            <input className="input" placeholder="Tipo de accidente o daño que puede ocurrir" value={form.riesgo}
              onChange={e => set('riesgo', e.target.value)} />
          </div>
          <div>
            <label className="label">Consecuencia Probable</label>
            <input className="input" placeholder="Daño esperado si ocurre el accidente" value={form.consecuencia}
              onChange={e => set('consecuencia', e.target.value)} />
          </div>
          <div>
            <label className="label">Medida de Control Recomendada</label>
            <textarea rows={2} className="input resize-none"
              placeholder="Acción correctiva o preventiva a implementar"
              value={form.medida_control}
              onChange={e => set('medida_control', e.target.value)} />
          </div>
          <div>
            <label className="label">Normativa Aplicable</label>
            <input className="input" placeholder="DS 594, Ley 16.744, etc." value={form.normativa}
              onChange={e => set('normativa', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Sección 3: Gestión ── */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          3. Asignación y Seguimiento
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Responsable de Corrección</label>
            <input className="input" placeholder="Nombre del responsable" value={form.responsable}
              onChange={e => set('responsable', e.target.value)} />
          </div>
          <div>
            <label className="label">Fecha de Ejecución</label>
            <input type="date" className="input" value={form.fecha_ejecucion}
              onChange={e => set('fecha_ejecucion', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observaciones</label>
            <textarea rows={2} className="input resize-none" placeholder="Notas adicionales..."
              value={form.observaciones}
              onChange={e => set('observaciones', e.target.value)} />
          </div>
        </div>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
        <button onClick={handleSave} className="btn-primary">
          {initial ? 'Actualizar' : 'Guardar Inspección'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Tarjeta de inspección ────────────────────────────────────────────────────

function InspeccionCard({
  item,
  onEdit,
  onDelete,
  onChangeEstado,
}: {
  item:            InspeccionRegistro
  onEdit:          () => void
  onDelete:        () => void
  onChangeEstado:  (estado: EstadoInspeccion) => void
}) {
  const cls = ESTADO_INSPECCION_COLOR[item.estado]
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">#{item.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls.bg} ${cls.text} ${cls.border}`}>
              {ESTADO_INSPECCION_LABEL[item.estado]}
            </span>
            <span className="text-xs text-slate-500">{fmtFecha(item.fecha_reporte)}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug">{item.ubicacion_descripcion || '(sin descripción)'}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit}
            className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            ✏️
          </button>
          <button onClick={onDelete}
            className="px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors">
            🗑️
          </button>
        </div>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
        <div>
          <span className="text-slate-400">Trabajador</span>
          <p className="font-medium text-slate-700 truncate">{item.nombre_trabajador || '—'}</p>
        </div>
        <div>
          <span className="text-slate-400">Área</span>
          <p className="font-medium text-slate-700 truncate">{item.area_trabajo || '—'}</p>
        </div>
        <div>
          <span className="text-slate-400">Responsable</span>
          <p className="font-medium text-slate-700 truncate">{item.responsable || '—'}</p>
        </div>
        <div>
          <span className="text-slate-400">F. Ejecución</span>
          <p className="font-medium text-slate-700">{item.fecha_ejecucion ? fmtFecha(item.fecha_ejecucion) : '—'}</p>
        </div>
      </div>

      {/* Peligro/Riesgo */}
      {(item.peligro || item.riesgo) && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs">
          {item.peligro && (
            <div><span className="font-semibold text-[#1e3a5f]">Peligro:</span>{' '}
              <span className="text-slate-700">{item.peligro}</span></div>
          )}
          {item.riesgo && (
            <div><span className="font-semibold text-[#1e3a5f]">Riesgo:</span>{' '}
              <span className="text-slate-700">{item.riesgo}</span></div>
          )}
          {item.medida_control && (
            <div><span className="font-semibold text-green-700">Medida:</span>{' '}
              <span className="text-slate-700">{item.medida_control}</span></div>
          )}
          {item.normativa && (
            <div><span className="font-semibold text-indigo-600">Normativa:</span>{' '}
              <span className="text-slate-500">{item.normativa}</span></div>
          )}
        </div>
      )}

      {/* Cambio rápido de estado */}
      <div className="flex gap-1.5 flex-wrap">
        {(['pendiente', 'en_proceso', 'cerrado'] as EstadoInspeccion[]).map(e => (
          <button
            key={e}
            onClick={() => onChangeEstado(e)}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-colors ${
              item.estado === e
                ? `${ESTADO_INSPECCION_COLOR[e].bg} ${ESTADO_INSPECCION_COLOR[e].text} ${ESTADO_INSPECCION_COLOR[e].border}`
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
          >
            {ESTADO_INSPECCION_LABEL[e]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InspeccionesPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { empresa, centro } = useAppStore()
  const lsKey = `inspecciones_${empresa?.id ?? 'default'}`

  const [registros, setRegistros]     = useState<InspeccionRegistro[]>([])
  const [showModal,  setShowModal]     = useState(false)
  const [editItem,   setEditItem]      = useState<InspeccionRegistro | undefined>()
  const [filtroEstado, setFiltroEstado] = useState<EstadoInspeccion | 'todos'>('todos')
  const [busqueda,   setBusqueda]      = useState('')
  const [confirmDel, setConfirmDel]    = useState<string | null>(null)

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey)
      if (raw) setRegistros(JSON.parse(raw))
    } catch { /* noop */ }
  }, [lsKey])

  // Guardar en localStorage
  function persist(data: InspeccionRegistro[]) {
    setRegistros(data)
    try { localStorage.setItem(lsKey, JSON.stringify(data)) } catch { /* noop */ }
  }

  // Guardar / actualizar registro
  function handleSave(form: FormState) {
    if (editItem) {
      persist(registros.map(r => r.id === editItem.id
        ? { ...editItem, ...form, fecha_ejecucion: form.fecha_ejecucion || null }
        : r
      ))
    } else {
      const nuevo: InspeccionRegistro = {
        id:             genId(),
        empresa_id:     empresa?.id ?? '',
        created_at:     new Date().toISOString(),
        ...form,
        fecha_ejecucion: form.fecha_ejecucion || null,
      }
      persist([nuevo, ...registros])
    }
    setShowModal(false)
    setEditItem(undefined)
  }

  function handleDelete(id: string) {
    persist(registros.filter(r => r.id !== id))
    setConfirmDel(null)
  }

  function handleChangeEstado(id: string, estado: EstadoInspeccion) {
    persist(registros.map(r => r.id === id ? { ...r, estado } : r))
  }

  // Filtros
  const filtrados = registros.filter(r => {
    const matchEstado = filtroEstado === 'todos' || r.estado === filtroEstado
    const q = busqueda.toLowerCase()
    const matchBusqueda = !q || [r.nombre_trabajador, r.area_trabajo,
      r.ubicacion_descripcion, r.peligro, r.riesgo, r.responsable]
      .some(f => f?.toLowerCase().includes(q))
    return matchEstado && matchBusqueda
  })

  // Stats
  const stats = {
    total:      registros.length,
    pendiente:  registros.filter(r => r.estado === 'pendiente').length,
    en_proceso: registros.filter(r => r.estado === 'en_proceso').length,
    cerrado:    registros.filter(r => r.estado === 'cerrado').length,
  }

  if (!mounted) return <div className="p-6 animate-pulse"><div className="h-8 bg-slate-200 rounded w-64" /></div>

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inspección de Condiciones Inseguras</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Reporte y seguimiento de condiciones inseguras de trabajo · DS 44 · Ley 16.744
          </p>
          {empresa && (
            <p className="text-xs text-slate-400 mt-0.5">
              {empresa.razon_social}{centro ? ` · ${centro.nombre}` : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditItem(undefined); setShowModal(true) }}
          className="btn-primary flex items-center gap-1.5"
        >
          + Nueva Inspección
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      val: stats.total,      color: 'text-[#1e3a5f]', bg: 'bg-white' },
          { label: 'Pendiente',  val: stats.pendiente,  color: 'text-red-600',   bg: 'bg-red-50' },
          { label: 'En Proceso', val: stats.en_proceso, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Cerrado',    val: stats.cerrado,    color: 'text-green-700', bg: 'bg-green-50' },
        ].map(c => (
          <button
            key={c.label}
            onClick={() => setFiltroEstado(c.label === 'Total' ? 'todos' : c.label.toLowerCase().replace(' ', '_') as EstadoInspeccion)}
            className={`${c.bg} border border-slate-200 rounded-xl p-3 text-center hover:shadow-sm transition-all`}
          >
            <div className={`text-2xl font-bold ${c.color}`}>{c.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Tabs estado */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(['todos', 'pendiente', 'en_proceso', 'cerrado'] as const).map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filtroEstado === e ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {e === 'todos' ? 'Todos' : ESTADO_INSPECCION_LABEL[e]}
            </button>
          ))}
        </div>
        {/* Búsqueda */}
        <input
          className="input flex-1 min-w-[180px] text-sm"
          placeholder="🔍 Buscar por trabajador, área, peligro…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">
            {registros.length === 0
              ? 'No hay inspecciones registradas. Haz clic en "+ Nueva Inspección" para comenzar.'
              : 'No se encontraron inspecciones con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(item => (
            <InspeccionCard
              key={item.id}
              item={item}
              onEdit={() => { setEditItem(item); setShowModal(true) }}
              onDelete={() => setConfirmDel(item.id)}
              onChangeEstado={(estado) => handleChangeEstado(item.id, estado)}
            />
          ))}
          <p className="text-[11px] text-slate-400 text-center pt-1">
            {filtrados.length} de {registros.length} inspección{registros.length !== 1 ? 'es' : ''}
          </p>
        </div>
      )}

      {/* Modal: Nueva / Editar */}
      {showModal && (
        <Modal
          title={editItem ? 'Editar Inspección' : 'Nueva Inspección de Condición Insegura'}
          onClose={() => { setShowModal(false); setEditItem(undefined) }}
        >
          <InspeccionForm
            initial={editItem}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditItem(undefined) }}
          />
        </Modal>
      )}

      {/* Modal: Confirmar eliminar */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar inspección?</h2>
            <p className="text-sm text-slate-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDel)}
                className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 text-sm">
                Eliminar
              </button>
              <button onClick={() => setConfirmDel(null)} className="flex-1 btn-secondary text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer nota */}
      <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
        Los datos se guardan localmente por empresa. Para respaldo permanente, exporte el informe periódicamente.
      </div>
    </div>
  )
}
