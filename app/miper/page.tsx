'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/src/store/app-store'
import { evaluarRiesgo } from '@/src/lib/risk-engine'
import Modal from '@/components/Modal'
import RiesgoBadge from '@/components/RiesgoBadge'
import AsistenteIA, { type CamposAceptados } from '@/src/components/AsistenteIA'
import type {
  Tarea, MiperRegistro, Proceso,
  Probabilidad, Consecuencia, TipoControl, ClasificacionRiesgo, FactorRiesgoMiper,
} from '@/src/types'
import {
  LABEL_PROBABILIDAD, LABEL_CONSECUENCIA, LABEL_CONTROL,
  COLOR_RIESGO, CATALOGO_RIESGOS, LABEL_CATALOGO_RIESGO,
  categoriaEvaluacion,
} from '@/src/types'
import type { ContextoTarea, SugerenciaIA } from '@/src/types/ai'
import { LABEL_FACTOR_RIESGO } from '@/src/types/ai'
import type { FactorRiesgo } from '@/src/types/ai'
import { dbSugerenciaIA } from '@/src/lib/db'

// ─── Colores y descripciones de criterios de evaluación ──────────────────────

const COLOR_PROB: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  baja:  { bg: 'bg-green-50',  text: 'text-green-800',  ring: 'border-green-400', dot: 'bg-green-500'  },
  media: { bg: 'bg-yellow-50', text: 'text-yellow-800', ring: 'border-yellow-400',dot: 'bg-yellow-400' },
  alta:  { bg: 'bg-red-50',    text: 'text-red-800',    ring: 'border-red-400',   dot: 'bg-red-500'   },
}

const COLOR_CONS: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  ligeramente_danino:    { bg: 'bg-green-50',  text: 'text-green-800',  ring: 'border-green-400',  dot: 'bg-green-500'  },
  danino:                { bg: 'bg-yellow-50', text: 'text-yellow-800', ring: 'border-yellow-400', dot: 'bg-yellow-400' },
  extremadamente_danino: { bg: 'bg-red-50',    text: 'text-red-800',    ring: 'border-red-400',    dot: 'bg-red-500'   },
}

const DESC_PROB: Record<string, string> = {
  baja:  'El daño ocurrirá rara vez o en contadas ocasiones (posibilidad de ocurrencia remota).',
  media: 'El daño ocurrirá en varias ocasiones (posibilidad de ocurrencia mediana), no siendo tan evidente.',
  alta:  'El daño ocurrirá siempre o casi siempre (posibilidad de ocurrencia inmediata, siendo evidente que pasará).',
}

const DESC_CONS: Record<string, string> = {
  ligeramente_danino:    'Pequeñas lesiones o daños superficiales (cortes, magulladuras, etc.) o molestias con tiempos rápidos de recuperación.',
  danino:                'Lesiones (laceraciones, quemaduras, torceduras, etc.) y/o intoxicaciones que pueden causar incapacidad temporal.',
  extremadamente_danino: 'Eventos extremadamente dañinos: amputaciones, lesiones múltiples con incapacidades permanentes o lesiones fatales.',
}

// ─── Selector con color + descripción ────────────────────────────────────────

function ColorSelect<T extends string>({
  value, onChange, options,
}: {
  value:    T
  onChange: (v: T) => void
  options:  { value: T; label: string; desc: string; colors: { bg: string; text: string; ring: string; dot: string } }[]
}) {
  const [open, setOpen] = useState(false)
  const sel = options.find(o => o.value === value) ?? options[0]
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left text-sm font-semibold transition-colors
          ${sel.colors.bg} ${sel.colors.text} ${sel.colors.ring}`}
      >
        <span className={`w-3 h-3 rounded-full shrink-0 ${sel.colors.dot}`} />
        <span className="flex-1">{sel.label}</span>
        <span className="text-xs opacity-50 ml-1">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0
                transition-colors ${value === opt.value ? opt.colors.bg : 'bg-white'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full shrink-0 ${opt.colors.dot}`} />
                <span className={`text-sm font-bold ${opt.colors.text}`}>{opt.label}</span>
                {value === opt.value && <span className="ml-auto text-xs opacity-50">✓</span>}
              </div>
              <p className="text-[11px] text-slate-500 pl-5 leading-snug">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Formulario MIPER ─────────────────────────────────────────────────────────

function MiperForm({
  tarea,
  proceso,
  initial,
  onClose,
}: {
  tarea:    Tarea
  proceso:  Proceso | undefined
  initial?: MiperRegistro
  onClose:  () => void
}) {
  const { addMiper, updateMiper, empresa, centro } = useAppStore()

  const [form, setForm] = useState({
    peligro:             initial?.peligro ?? '',
    riesgo:              initial?.riesgo ?? '',
    dano_probable:       initial?.dano_probable ?? '',
    factor_riesgo:       (initial?.factor_riesgo ?? '') as FactorRiesgoMiper | '',
    probabilidad:        (initial?.probabilidad ?? 'baja') as Probabilidad,
    consecuencia:        (initial?.consecuencia ?? 'ligeramente_danino') as Consecuencia,
    tipo_control:        (initial?.tipo_control ?? '') as TipoControl | '',
    medida_control:      initial?.medida_control ?? '',
    responsable_control: initial?.responsable_control ?? '',
    plazo_control:       initial?.plazo_control ?? '',
    esta_controlado:     initial?.esta_controlado ?? false,
    fecha_elaboracion:   initial?.fecha_elaboracion ?? new Date().toISOString().split('T')[0],
    tarea_id:            tarea.id,
  })

  const [err,               setErr]           = useState('')
  const [guardando,         setGuardando]      = useState(false)
  const [sugerenciaId,      setSugerenciaId]   = useState<string | null>(null)
  const [sugerenciaAceptada, setSugerenciaAceptada] = useState<SugerenciaIA | null>(null)
  const [showIA,            setShowIA]         = useState(!initial)  // panel abierto en nuevo registro

  const { mr, clasificacion } = evaluarRiesgo(form.probabilidad, form.consecuencia)

  // Categoría de evaluación según factor seleccionado (Guía V3 2024)
  const categ = categoriaEvaluacion(form.factor_riesgo)

  // Para no-Seguridad: el usuario elige el nivel (resultado de protocolo externo).
  // Mapeamos a P×C equivalente para que la DB genere mr y clasificacion_riesgo correctos.
  const NIVEL_TO_PC: Record<ClasificacionRiesgo, { p: Probabilidad; c: Consecuencia }> = {
    tolerable:   { p: 'baja',  c: 'ligeramente_danino' },   // 1×1 = 1 → tolerable
    moderado:    { p: 'media', c: 'danino' },                // 2×2 = 4 → moderado
    importante:  { p: 'alta',  c: 'danino' },                // 4×2 = 8 → importante
    intolerable: { p: 'alta',  c: 'extremadamente_danino' }, // 4×4 = 16 → intolerable
  }

  function handleNivelProtocolo(nivel: ClasificacionRiesgo) {
    const { p, c } = NIVEL_TO_PC[nivel]
    setForm(s => ({ ...s, probabilidad: p, consecuencia: c }))
  }

  const PROTOCOLO_INFO: Record<string, string> = {
    higienico:   'Ingresa el resultado según DS 594/99 o protocolo MINSAL correspondiente.',
    psicosocial: 'Ingresa el resultado según Protocolo ISTAS21 / SUSESO vigente.',
    musculo:     'Ingresa el resultado según Protocolo TMERT-EESS o Guía MMC (Ley 20.949).',
  }

  const ACCION: Record<ClasificacionRiesgo, string> = {
    tolerable:   'Comprobaciones periódicas. No se requiere mejora urgente.',
    moderado:    'Reducir el riesgo en un período determinado.',
    importante:  'No iniciar ni continuar el trabajo hasta reducir el riesgo.',
    intolerable: 'No iniciar ni continuar. Prohibir si no se puede reducir.',
  }

  // ── Contexto para IA ──────────────────────────────────────────────────────

  const contextoIA: ContextoTarea = {
    empresa_razon_social:  empresa?.razon_social ?? '',
    empresa_actividad:     empresa?.actividad_economica ?? '',
    centro_nombre:         centro?.nombre ?? '',
    proceso_nombre:        proceso?.nombre ?? '',
    proceso_tipo:          proceso?.tipo ?? '',
    actividad:             tarea.actividad,
    descripcion_tarea:     tarea.descripcion_tarea,
    puesto_trabajo:        tarea.puesto_trabajo,
    lugar_ejecucion:       tarea.lugar_ejecucion,
    equipos_involucrados:  tarea.equipos_involucrados ?? '',
    materiales_sustancias: tarea.materiales_sustancias ?? '',
    n_trabajadores_total:  (tarea.n_trabajadores_hombres ?? 0)
                          + (tarea.n_trabajadores_mujeres ?? 0)
                          + (tarea.n_trabajadores_otro ?? 0),
    es_rutinaria:          tarea.es_rutinaria,
  }

  // ── Handler: aceptar sugerencia IA ────────────────────────────────────────

  const handleAceptarSugerencia = useCallback(
    async (campos: CamposAceptados, sugerencia: SugerenciaIA) => {
      // 1. Rellenar formulario con los campos sugeridos
      setForm(s => ({
        ...s,
        peligro:             campos.peligro,
        riesgo:              campos.riesgo,
        dano_probable:       campos.dano_probable,
        factor_riesgo:       (campos.factor_riesgo as FactorRiesgoMiper | ''),
        probabilidad:        campos.probabilidad as Probabilidad,
        consecuencia:        campos.consecuencia as Consecuencia,
        tipo_control:        campos.tipo_control as TipoControl | '',
        medida_control:      campos.medida_control,
        responsable_control: campos.responsable_control,
      }))

      setSugerenciaAceptada(sugerencia)
      setShowIA(false)

      // 2. Persistir sugerencia en DB con estado 'aceptada'
      try {
        const saved = await dbSugerenciaIA.insert({
          tarea_id:        tarea.id,
          modo_ia:         'local',
          contexto_json:   contextoIA,
          sugerencia_json: sugerencia,
        })
        // Marcar como aceptada
        await dbSugerenciaIA.actualizarEstado(saved.id, 'aceptada')
        setSugerenciaId(saved.id)
      } catch {
        // No bloqueante — la sugerencia se refleja en el formulario igualmente
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tarea.id]
  )

  const handleDescartarSugerencia = useCallback(async () => {
    // Si se generó una sugerencia guardada, marcarla como rechazada
    if (sugerenciaId) {
      try {
        await dbSugerenciaIA.actualizarEstado(sugerenciaId, 'rechazada')
      } catch { /* silenciar */ }
    }
    setShowIA(false)
  }, [sugerenciaId])

  // ── Guardar MIPER ─────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.peligro.trim() || !form.riesgo.trim()) {
      setErr('El peligro y el riesgo son obligatorios.')
      return
    }
    setGuardando(true)
    setErr('')
    try {
      if (initial) {
        await updateMiper(initial.id, form)
      } else {
        const saved = await addMiper(form)
        // Si hay sugerencia aceptada, actualizarla con el miper_id
        if (sugerenciaId) {
          try {
            await dbSugerenciaIA.actualizarEstado(sugerenciaId, 'aceptada', {
              miper_id: saved.id,
            })
          } catch { /* silenciar */ }
        }
      }
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Contexto de la tarea */}
      <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500 grid grid-cols-2 gap-2">
        <span><strong>Actividad:</strong> {tarea.actividad}</span>
        <span><strong>Tarea:</strong> {tarea.descripcion_tarea}</span>
        <span><strong>Puesto:</strong> {tarea.puesto_trabajo}</span>
        <span><strong>Lugar:</strong> {tarea.lugar_ejecucion}</span>
        {tarea.equipos_involucrados && (
          <span className="col-span-2"><strong>Equipos:</strong> {tarea.equipos_involucrados}</span>
        )}
        {tarea.materiales_sustancias && (
          <span className="col-span-2"><strong>Materiales:</strong> {tarea.materiales_sustancias}</span>
        )}
      </div>

      {/* ── Panel IA (solo en nuevo registro) ────────────────────────────────── */}
      {!initial && (
        <div>
          {/* Toggle del panel */}
          {!showIA && (
            <button
              type="button"
              onClick={() => setShowIA(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors"
            >
              <span>🤖</span>
              {sugerenciaAceptada
                ? '✅ Sugerencia IA aplicada — ver de nuevo'
                : 'Usar Asistente IA Preventivo'}
            </button>
          )}

          {/* Banner de sugerencia aceptada */}
          {sugerenciaAceptada && !showIA && (
            <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
              <p className="text-xs text-green-700">
                <span className="font-semibold">✅ Campos completados por IA:</span>{' '}
                peligro, riesgo, daño probable, factor de riesgo, probabilidad, consecuencia, tipo de control y medida.
                Puedes editarlos antes de guardar.
              </p>
            </div>
          )}

          {showIA && (
            <AsistenteIA
              contexto={contextoIA}
              modo="local"
              onAceptar={handleAceptarSugerencia}
              onDescartar={handleDescartarSugerencia}
            />
          )}
        </div>
      )}

      {/* ── Sección 1: Identificación del Peligro ────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          1. Identificación del Peligro
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Peligro *</label>
            <input
              className="input"
              placeholder="Ej: Exposición a harina en suspensión"
              value={form.peligro}
              onChange={e => setForm(s => ({ ...s, peligro: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Riesgo *</label>
            <input
              className="input"
              placeholder="Ej: Enfermedad respiratoria profesional"
              value={form.riesgo}
              onChange={e => setForm(s => ({ ...s, riesgo: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Factor de Riesgo (Catálogo Anexo N°3)</label>
            <select
              className="select"
              value={form.factor_riesgo}
              onChange={e => setForm(s => ({ ...s, factor_riesgo: e.target.value as FactorRiesgoMiper }))}
            >
              <option value="">— Seleccionar factor —</option>
              {CATALOGO_RIESGOS.map(grupo => (
                <optgroup key={grupo.grupo} label={grupo.grupo}>
                  {grupo.opciones.map(({ codigo, label }) => (
                    <option key={codigo} value={codigo}>{label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {form.factor_riesgo && LABEL_CATALOGO_RIESGO[form.factor_riesgo] && (
              <p className="text-[10px] text-indigo-600 mt-1">
                ✓ {LABEL_CATALOGO_RIESGO[form.factor_riesgo]}
              </p>
            )}
          </div>
          {categ === 'seguridad' && (
            <div>
              <label className="label">Daño Probable</label>
              <input
                className="input"
                placeholder="Ej: Asma ocupacional, rinitis, fractura"
                value={form.dano_probable}
                onChange={e => setForm(s => ({ ...s, dano_probable: e.target.value }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Sección 2: Evaluación del Riesgo ─────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-1">
          {categ === 'seguridad'
            ? '2. Evaluación del Riesgo — De Seguridad y Emergencias (VEP = P × S)'
            : categ === 'higienico'
              ? '2. Evaluación del Riesgo — Higiénico (Magnitud de la Exposición)'
              : categ === 'psicosocial'
                ? '2. Evaluación del Riesgo — Psicosocial (Protocolo ISTAS21)'
                : '2. Evaluación del Riesgo — Músculo Esquelético (TMERT / MMC)'}
        </h3>

        {/* ── Seguridad: P × S ───────────────────────────────────────────────── */}
        {categ === 'seguridad' && (
          <>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="label">Probabilidad (P)</label>
                <ColorSelect<Probabilidad>
                  value={form.probabilidad}
                  onChange={v => setForm(s => ({ ...s, probabilidad: v }))}
                  options={[
                    { value: 'baja',  label: 'Baja (1)',  desc: DESC_PROB.baja,  colors: COLOR_PROB.baja  },
                    { value: 'media', label: 'Media (2)', desc: DESC_PROB.media, colors: COLOR_PROB.media },
                    { value: 'alta',  label: 'Alta (4)',  desc: DESC_PROB.alta,  colors: COLOR_PROB.alta  },
                  ]}
                />
              </div>
              <div>
                <label className="label">Consecuencia / Severidad (S)</label>
                <ColorSelect<Consecuencia>
                  value={form.consecuencia}
                  onChange={v => setForm(s => ({ ...s, consecuencia: v }))}
                  options={[
                    { value: 'ligeramente_danino',    label: 'Baja — Ligeramente Dañino (1)', desc: DESC_CONS.ligeramente_danino,    colors: COLOR_CONS.ligeramente_danino    },
                    { value: 'danino',                label: 'Media — Dañino (2)',             desc: DESC_CONS.danino,                colors: COLOR_CONS.danino                },
                    { value: 'extremadamente_danino', label: 'Alta — Extremadamente Dañino (4)', desc: DESC_CONS.extremadamente_danino, colors: COLOR_CONS.extremadamente_danino },
                  ]}
                />
              </div>
            </div>
            <div className={`mt-3 rounded-xl px-5 py-4 border ${COLOR_RIESGO[clasificacion as ClasificacionRiesgo]}`}>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black">{mr}</div>
                  <div className="text-[10px] font-semibold opacity-70 uppercase">VEP = P × S</div>
                </div>
                <div className="flex-1">
                  <RiesgoBadge clasificacion={clasificacion as ClasificacionRiesgo} size="md" />
                  <p className="text-xs mt-1 opacity-80">{ACCION[clasificacion as ClasificacionRiesgo]}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── No-Seguridad: nivel directo según protocolo ──────────────────────── */}
        {categ !== 'seguridad' && (
          <>
            <p className="text-[11px] text-slate-500 mb-3 mt-1">
              {PROTOCOLO_INFO[categ]}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Magnitud de la Exposición</label>
                <input
                  className="input"
                  placeholder="Ej: 45 dB(A) / Nivel alto / Resultado protocolo"
                  value={form.dano_probable}
                  onChange={e => setForm(s => ({ ...s, dano_probable: e.target.value }))}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Registra el valor o resultado obtenido del protocolo de evaluación.
                </p>
              </div>
              <div>
                <label className="label">Nivel de Riesgo (resultado protocolo)</label>
                <select
                  className="select"
                  value={clasificacion}
                  onChange={e => handleNivelProtocolo(e.target.value as ClasificacionRiesgo)}
                >
                  <option value="tolerable">Tolerable</option>
                  <option value="moderado">Moderado</option>
                  <option value="importante">Importante</option>
                  <option value="intolerable">Intolerable</option>
                </select>
              </div>
            </div>
            <div className={`mt-3 rounded-xl px-5 py-4 border ${COLOR_RIESGO[clasificacion as ClasificacionRiesgo]}`}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <RiesgoBadge clasificacion={clasificacion as ClasificacionRiesgo} size="md" />
                  <p className="text-xs mt-1 opacity-80">{ACCION[clasificacion as ClasificacionRiesgo]}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Sección 3: Medida de Control ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-3">
          3. Medidas de Control
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Jerarquía de Control</label>
            <select
              className="select"
              value={form.tipo_control}
              onChange={e => setForm(s => ({ ...s, tipo_control: e.target.value as TipoControl | '' }))}
            >
              <option value="">Seleccionar...</option>
              {(Object.entries(LABEL_CONTROL) as [TipoControl, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha Elaboración</label>
            <input
              type="date"
              className="input"
              value={form.fecha_elaboracion}
              onChange={e => setForm(s => ({ ...s, fecha_elaboracion: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Medidas de Control</label>
            <textarea
              rows={2}
              className="input resize-none"
              placeholder="Describe la medida de control específica"
              value={form.medida_control}
              onChange={e => setForm(s => ({ ...s, medida_control: e.target.value }))}
            />
            {form.medida_control.trim() && (
              <p className="text-[10px] text-green-600 mt-1">
                ✓ Esta medida se derivará automáticamente al Programa de Trabajo.
              </p>
            )}
          </div>
          <div>
            <label className="label">Responsable</label>
            <input
              className="input"
              placeholder="Nombre del responsable"
              value={form.responsable_control}
              onChange={e => setForm(s => ({ ...s, responsable_control: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Plazo</label>
            <input
              type="date"
              className="input"
              value={form.plazo_control}
              onChange={e => setForm(s => ({ ...s, plazo_control: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="controlado"
              checked={form.esta_controlado}
              onChange={e => setForm(s => ({ ...s, esta_controlado: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="controlado" className="text-sm text-slate-700 cursor-pointer">
              El riesgo está actualmente controlado
            </label>
          </div>
        </div>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={guardando} className="btn-primary disabled:opacity-60">
          {guardando ? 'Guardando…' : initial ? 'Actualizar Registro' : 'Guardar en MIPER'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function MiperPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const {
    procesos, tareas, miperRegistros, removeMiper,
    tareasByProceso, miperByTarea, procesoByTarea,
    error, limpiarError,
  } = useAppStore()

  const [procesoId,   setProcesoId]   = useState<string>('')
  const [showModal,   setShowModal]   = useState(false)
  const [editMiper,   setEditMiper]   = useState<MiperRegistro | undefined>()
  const [tareaActual, setTareaActual] = useState<Tarea | undefined>()
  const [expandidos,  setExpandidos]  = useState<Set<string>>(new Set())

  if (!mounted) return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-64" />
    </div>
  )

  const tareasFiltradas = procesoId ? tareasByProceso(procesoId) : []

  const toggleTarea = (id: string) =>
    setExpandidos(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  function openAdd(tarea: Tarea) {
    setTareaActual(tarea)
    setEditMiper(undefined)
    setShowModal(true)
  }

  function openEdit(miper: MiperRegistro, tarea: Tarea) {
    setTareaActual(tarea)
    setEditMiper(miper)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditMiper(undefined)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">MIPER</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Módulo 2 · Identificación de Peligros y Evaluación de Riesgos
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={limpiarError} className="ml-4 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {procesos.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">Primero completa el Levantamiento de Procesos.</p>
        </div>
      ) : (
        <>
          <div className="card p-4">
            <label className="label">Seleccionar Proceso</label>
            <select
              className="select max-w-md"
              value={procesoId}
              onChange={e => { setProcesoId(e.target.value); setExpandidos(new Set()) }}
            >
              <option value="">— Selecciona un proceso —</option>
              {procesos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.tipo})</option>
              ))}
            </select>
          </div>

          {!procesoId && (
            <div className="card p-8 text-center text-slate-400 text-sm">
              Selecciona un proceso para ver y gestionar su MIPER.
            </div>
          )}

          {tareasFiltradas.map(tarea => {
            const registros = miperByTarea(tarea.id)
            const open      = expandidos.has(tarea.id)

            return (
              <div key={tarea.id} className="card overflow-hidden">
                <div
                  className="section-header cursor-pointer select-none"
                  onClick={() => toggleTarea(tarea.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{open ? '▾' : '▸'}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{tarea.actividad}</div>
                      <div className="text-xs text-slate-400">
                        {tarea.puesto_trabajo} · {tarea.lugar_ejecucion} ·{' '}
                        <span className={tarea.es_rutinaria ? 'text-slate-400' : 'text-amber-600'}>
                          {tarea.es_rutinaria ? 'Rutinaria' : 'No Rutinaria'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-slate-400">
                      {registros.length} riesgo{registros.length !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => openAdd(tarea)} className="btn-primary text-xs px-3 py-1.5">
                      + Riesgo
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-slate-100">
                    {registros.length === 0 ? (
                      <div className="px-5 py-6 text-sm text-slate-400 text-center">
                        Sin riesgos registrados para esta tarea.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#1e3a5f]">
                            <tr>
                              {[
                                'Peligro','Riesgo','Factor','Probabilidad','Consecuencia','Nivel de Riesgo',
                                'Control','Medidas de Control','Responsable','Plazo','✓','Acciones',
                              ].map(h => <th key={h} className="table-th">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {registros.map(m => (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="table-td font-medium max-w-[140px]">{m.peligro}</td>
                                <td className="table-td text-slate-500 max-w-[140px]">{m.riesgo}</td>
                                <td className="table-td text-xs">
                                  {m.factor_riesgo ? (
                                    <span title={LABEL_CATALOGO_RIESGO[m.factor_riesgo] ?? ''}>
                                      <span className="font-bold text-[#1e3a5f]">{m.factor_riesgo}</span>
                                      {LABEL_CATALOGO_RIESGO[m.factor_riesgo] && (
                                        <span className="block text-[9px] text-slate-400 leading-tight mt-0.5 max-w-[90px]">
                                          {LABEL_CATALOGO_RIESGO[m.factor_riesgo].replace(/^[A-Z0-9]+ — /, '')}
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    (LABEL_FACTOR_RIESGO as Record<string, string>)[m.factor_riesgo] ?? '—'
                                  )}
                                </td>
                                <td className="table-td whitespace-nowrap text-xs p-1">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold
                                    ${COLOR_PROB[m.probabilidad]?.bg ?? ''} ${COLOR_PROB[m.probabilidad]?.text ?? ''}`}>
                                    <span className={`w-2 h-2 rounded-full ${COLOR_PROB[m.probabilidad]?.dot ?? ''}`} />
                                    {LABEL_PROBABILIDAD[m.probabilidad]}
                                  </span>
                                </td>
                                <td className="table-td whitespace-nowrap text-xs p-1">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold
                                    ${COLOR_CONS[m.consecuencia]?.bg ?? ''} ${COLOR_CONS[m.consecuencia]?.text ?? ''}`}>
                                    <span className={`w-2 h-2 rounded-full ${COLOR_CONS[m.consecuencia]?.dot ?? ''}`} />
                                    {LABEL_CONSECUENCIA[m.consecuencia]}
                                  </span>
                                </td>
                                <td className="table-td whitespace-nowrap">
                                  <RiesgoBadge
                                    clasificacion={m.clasificacion_riesgo as ClasificacionRiesgo}
                                    mr={m.mr}
                                    size="sm"
                                  />
                                </td>
                                <td className="table-td text-xs whitespace-nowrap">
                                  {m.tipo_control ? LABEL_CONTROL[m.tipo_control as TipoControl] : '—'}
                                </td>
                                <td className="table-td max-w-[160px] text-xs">{m.medida_control || '—'}</td>
                                <td className="table-td text-xs">{m.responsable_control || '—'}</td>
                                <td className="table-td text-xs whitespace-nowrap">{m.plazo_control || '—'}</td>
                                <td className="table-td">
                                  <span className={`inline-block w-3 h-3 rounded-full ${m.esta_controlado ? 'bg-green-500' : 'bg-slate-300'}`} />
                                </td>
                                <td className="table-td whitespace-nowrap">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEdit(m, tarea)}
                                      className="btn-secondary text-xs px-2 py-1"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('¿Eliminar este registro?')) removeMiper(m.id)
                                      }}
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
        </>
      )}

      {showModal && tareaActual && (
        <Modal
          title={editMiper ? 'Editar Registro MIPER' : 'Nuevo Registro MIPER'}
          onClose={closeModal}
          size="xl"
        >
          <MiperForm
            tarea={tareaActual}
            proceso={procesoByTarea(tareaActual.id)}
            initial={editMiper}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  )
}
