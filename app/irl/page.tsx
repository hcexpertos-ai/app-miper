'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/src/store/app-store'
import Modal from '@/components/Modal'
import type {
  IrlRegistro, MiperRegistro, Tarea, Proceso,
  Empresa, CentroTrabajo, ModalidadIrl, TipoActividadIrl, MotivoIrl,
  MaterialAdjunto,
} from '@/src/types'
import {
  LABEL_MOTIVO_IRL, LABEL_MODALIDAD_IRL, LABEL_TIPO_ACTIVIDAD_IRL,
  LABEL_CATALOGO_RIESGO, LABEL_CONTROL,
} from '@/src/types'
import { exportarWord } from './generate-word'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoy = () => new Date().toISOString().split('T')[0]
const fmtFecha = (iso: string) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('es-CL') : '—'

// ─── Form vacío ──────────────────────────────────────────────────────────────

function formVacio(tareaId = ''): Omit<IrlRegistro, 'id' | 'created_at'> {
  return {
    tarea_id:                tareaId,
    nombre_actividad:        'Informar de los Riesgos Laborales',
    fecha_inicio:            hoy(),
    fecha_fin:               hoy(),
    modalidad:               'presencial',
    n_horas:                 '1',
    tipo_actividad:          'interna',
    ejecutor_externo:        '',
    relator_nombre:          '',
    relator_cargo:           'Experto en Prevención de Riesgos',
    grupo_objetivo:          '',
    espacio_trabajo:         '',
    condiciones_ambientales: '',
    condiciones_orden_aseo:  '',
    maquinas_herramientas:   '',
    material_complemento:    false,
    materiales_json:         [],
    nombre_trabajador:       '',
    rut_trabajador:          '',
    cargo_trabajador:        '',
    motivo:                  'nuevo',
    fecha_entrega:           hoy(),
  }
}

// ─── Secciones del formulario ────────────────────────────────────────────────

const SECCIONES = [
  { id: 'actividad',    label: '1. Actividad',        icon: '📋' },
  { id: 'lugar',        label: '2. Lugar de Trabajo',  icon: '🏗️' },
  { id: 'riesgos',      label: '3. Riesgos MIPER',    icon: '⚠️' },
  { id: 'material',     label: '4. Material',          icon: '📎' },
  { id: 'participante', label: '5. Participante',       icon: '👷' },
] as const

type SeccionId = typeof SECCIONES[number]['id']

// ─── Modal Formulario ─────────────────────────────────────────────────────────

function IrlFormModal({
  tareaId, miperRows, tarea,
  initial, onSave, onClose,
}: {
  tareaId:   string
  miperRows: MiperRegistro[]
  tarea:     Tarea | undefined
  initial?:  IrlRegistro
  onSave:    (data: Omit<IrlRegistro, 'id' | 'created_at'>) => Promise<void>
  onClose:   () => void
}) {
  const [form, setForm]       = useState<Omit<IrlRegistro, 'id' | 'created_at'>>(
    initial ? { ...initial } : formVacio(tareaId)
  )
  const [seccion, setSeccion] = useState<SeccionId>('actividad')
  const [guardando, setGuardando] = useState(false)

  const set = (k: keyof typeof form, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }))

  // Auto-poblar desde tarea
  useEffect(() => {
    if (!initial && tarea) {
      setForm(f => ({
        ...f,
        maquinas_herramientas: tarea.equipos_involucrados || '',
        grupo_objetivo:        tarea.puesto_trabajo || '',
      }))
    }
  }, [tarea, initial])

  const handleSave = async () => {
    if (!form.nombre_trabajador.trim()) {
      alert('Ingresa el nombre del trabajador.')
      setSeccion('participante')
      return
    }
    setGuardando(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setGuardando(false)
    }
  }

  // Añadir / quitar material adjunto
  const addMaterial = () =>
    set('materiales_json', [...form.materiales_json, { nombre: '', tipo: '' }])
  const removeMaterial = (i: number) =>
    set('materiales_json', form.materiales_json.filter((_, idx) => idx !== i))
  const updateMaterial = (i: number, k: keyof MaterialAdjunto, v: string) =>
    set('materiales_json', form.materiales_json.map((m, idx) =>
      idx === i ? { ...m, [k]: v } : m
    ))

  return (
    <Modal
      title={initial ? 'Editar IRL' : 'Nuevo IRL — Información de Riesgos Laborales'}
      onClose={onClose}
      size="xl"
    >
      {/* Tabs de sección */}
      <div className="flex gap-1 flex-wrap mb-5 border-b border-slate-100 pb-3">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${seccion === s.id
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Sección 1: Actividad ── */}
      {seccion === 'actividad' && (
        <div className="space-y-4">
          <div>
            <label className="label">Nombre de la actividad *</label>
            <input className="input" value={form.nombre_actividad}
              onChange={e => set('nombre_actividad', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha inicio</label>
              <input type="date" className="input" value={form.fecha_inicio}
                onChange={e => set('fecha_inicio', e.target.value)} />
            </div>
            <div>
              <label className="label">Fecha término</label>
              <input type="date" className="input" value={form.fecha_fin}
                onChange={e => set('fecha_fin', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Modalidad</label>
              <select className="input" value={form.modalidad}
                onChange={e => set('modalidad', e.target.value as ModalidadIrl)}>
                {(Object.keys(LABEL_MODALIDAD_IRL) as ModalidadIrl[]).map(k => (
                  <option key={k} value={k}>{LABEL_MODALIDAD_IRL[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">N° de horas</label>
              <input className="input" value={form.n_horas}
                onChange={e => set('n_horas', e.target.value)} placeholder="Ej: 1" />
            </div>
          </div>

          <div>
            <label className="label">Tipo de actividad</label>
            <div className="flex gap-4">
              {(Object.keys(LABEL_TIPO_ACTIVIDAD_IRL) as TipoActividadIrl[]).map(k => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="tipo_actividad" value={k}
                    checked={form.tipo_actividad === k}
                    onChange={() => set('tipo_actividad', k)} />
                  {LABEL_TIPO_ACTIVIDAD_IRL[k]}
                </label>
              ))}
            </div>
          </div>

          {form.tipo_actividad === 'externa' ? (
            <div>
              <label className="label">Quién ejecuta (externo)</label>
              <input className="input" value={form.ejecutor_externo}
                onChange={e => set('ejecutor_externo', e.target.value)}
                placeholder="Nombre de la empresa/persona externa" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre del relator</label>
                <input className="input" value={form.relator_nombre}
                  onChange={e => set('relator_nombre', e.target.value)} />
              </div>
              <div>
                <label className="label">Cargo del relator</label>
                <input className="input" value={form.relator_cargo}
                  onChange={e => set('relator_cargo', e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="label">Grupo objetivo / Comentarios</label>
            <textarea className="input min-h-[72px] resize-none" value={form.grupo_objetivo}
              onChange={e => set('grupo_objetivo', e.target.value)}
              placeholder="Describe quiénes son los participantes..." />
          </div>
        </div>
      )}

      {/* ── Sección 2: Lugar de Trabajo ── */}
      {seccion === 'lugar' && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            Describe las características mínimas de seguridad del lugar donde se ejecutarán las labores.
          </div>
          {[
            { key: 'espacio_trabajo',         label: 'Espacio de trabajo', ph: 'Condiciones del espacio físico: altura, superficie, accesos...' },
            { key: 'condiciones_ambientales',  label: 'Condiciones ambientales', ph: 'Iluminación, ventilación, temperatura, ruido...' },
            { key: 'condiciones_orden_aseo',   label: 'Orden y aseo', ph: 'Condiciones de limpieza y organización exigidas...' },
            { key: 'maquinas_herramientas',    label: 'Máquinas y herramientas', ph: 'Equipos a utilizar y sus características de seguridad...' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={form[key as keyof typeof form] as string}
                onChange={e => set(key as keyof typeof form, e.target.value)}
                placeholder={ph}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Sección 3: Riesgos (auto desde MIPER) ── */}
      {seccion === 'riesgos' && (
        <div className="space-y-3">
          <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
            <span>⚡</span>
            <span>Los riesgos se toman automáticamente del MIPER para la tarea seleccionada. Son de solo lectura aquí.</span>
          </div>
          {miperRows.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No hay registros MIPER para esta tarea.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white">
                    <th className="px-3 py-2 text-left">Riesgos</th>
                    <th className="px-3 py-2 text-left">Consecuencias</th>
                    <th className="px-3 py-2 text-left">Medidas de Control</th>
                    <th className="px-3 py-2 text-left">Métodos o Procedimientos de Trabajo</th>
                  </tr>
                </thead>
                <tbody>
                  {miperRows.map((m, i) => (
                    <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 border border-slate-100">
                        <div className="font-medium text-slate-800">{m.peligro}</div>
                        <div className="text-slate-500">{m.riesgo}</div>
                      </td>
                      <td className="px-3 py-2 border border-slate-100 text-slate-700">
                        {m.dano_probable || '—'}
                      </td>
                      <td className="px-3 py-2 border border-slate-100 text-slate-700">
                        {m.medida_control || '—'}
                      </td>
                      <td className="px-3 py-2 border border-slate-100 text-slate-600">
                        {m.tipo_control ? LABEL_CONTROL[m.tipo_control] : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sección 4: Material de Complemento ── */}
      {seccion === 'material' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="label mb-0">¿Se adjunta material de complemento?</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.material_complemento}
                onChange={e => set('material_complemento', e.target.checked)}
                className="w-4 h-4 accent-[#1e3a5f]" />
              <span className="text-sm text-slate-700">Sí</span>
            </label>
          </div>

          {form.material_complemento && (
            <div className="space-y-2">
              {form.materiales_json.map((mat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="input flex-1" placeholder="Nombre del material"
                    value={mat.nombre}
                    onChange={e => updateMaterial(i, 'nombre', e.target.value)} />
                  <input className="input w-32" placeholder="Tipo (pdf, ppt…)"
                    value={mat.tipo}
                    onChange={e => updateMaterial(i, 'tipo', e.target.value)} />
                  <button onClick={() => removeMaterial(i)}
                    className="text-red-400 hover:text-red-600 text-lg px-1">✕</button>
                </div>
              ))}
              <button onClick={addMaterial}
                className="text-sm text-[#1e3a5f] hover:underline flex items-center gap-1">
                + Agregar material
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Sección 5: Participante ── */}
      {seccion === 'participante' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre del trabajador *</label>
              <input className="input" value={form.nombre_trabajador}
                onChange={e => set('nombre_trabajador', e.target.value)}
                placeholder="Nombre completo" />
            </div>
            <div>
              <label className="label">RUT</label>
              <input className="input" value={form.rut_trabajador}
                onChange={e => set('rut_trabajador', e.target.value)}
                placeholder="12.345.678-9" />
            </div>
          </div>

          <div>
            <label className="label">Cargo</label>
            <input className="input" value={form.cargo_trabajador}
              onChange={e => set('cargo_trabajador', e.target.value)} />
          </div>

          <div>
            <label className="label">Motivo de la charla</label>
            <div className="flex flex-col gap-2">
              {(Object.keys(LABEL_MOTIVO_IRL) as MotivoIrl[]).map(k => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="motivo" value={k}
                    checked={form.motivo === k}
                    onChange={() => set('motivo', k)} />
                  {LABEL_MOTIVO_IRL[k]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Fecha de entrega</label>
            <input type="date" className="input max-w-xs" value={form.fecha_entrega}
              onChange={e => set('fecha_entrega', e.target.value)} />
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <div className="flex gap-2">
          {SECCIONES.map((s, i) => {
            const idx = SECCIONES.findIndex(x => x.id === seccion)
            return null
            void i
          })}
          {seccion !== SECCIONES[0].id && (
            <button onClick={() => {
              const idx = SECCIONES.findIndex(s => s.id === seccion)
              setSeccion(SECCIONES[idx - 1].id)
            }} className="btn-secondary text-sm px-3 py-2">← Anterior</button>
          )}
          {seccion !== SECCIONES[SECCIONES.length - 1].id && (
            <button onClick={() => {
              const idx = SECCIONES.findIndex(s => s.id === seccion)
              setSeccion(SECCIONES[idx + 1].id)
            }} className="btn-primary text-sm px-3 py-2">Siguiente →</button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary text-sm px-3 py-2">Cancelar</button>
          <button onClick={handleSave} disabled={guardando}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
            {guardando ? 'Guardando…' : initial ? '💾 Actualizar' : '💾 Guardar IRL'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Vista de impresión ───────────────────────────────────────────────────────

function IrlViewer({
  irl, tarea, proceso, empresa, centro, miperRows, onClose,
}: {
  irl:       IrlRegistro
  tarea:     Tarea | undefined
  proceso:   Proceso | undefined
  empresa:   Empresa | null
  centro:    CentroTrabajo | null
  miperRows: MiperRegistro[]
  onClose:   () => void
}) {
  const [descargandoWord, setDescargandoWord] = useState(false)

  const handleWord = async () => {
    setDescargandoWord(true)
    try {
      await exportarWord(irl, { tarea, proceso, empresa, centro, miperRows })
    } finally {
      setDescargandoWord(false)
    }
  }

  const handleImprimir = () => window.print()

  return (
    <>
      {/* Barra de acción (solo pantalla) */}
      <div className="print:hidden fixed top-0 inset-x-0 z-50 bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">Vista IRL — {irl.nombre_trabajador}</span>
        <div className="flex gap-2">
          <button onClick={handleWord} disabled={descargandoWord}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5">
            {descargandoWord ? '⏳' : '📝'} {descargandoWord ? 'Generando…' : 'Word'}
          </button>
          <button onClick={handleImprimir}
            className="bg-white text-[#1e3a5f] text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
            🖨️ Imprimir / PDF
          </button>
          <button onClick={onClose}
            className="text-white/70 hover:text-white text-sm px-2">✕ Cerrar</button>
        </div>
      </div>

      {/* Documento imprimible */}
      <div className="print:pt-0 pt-16 min-h-screen bg-slate-100 print:bg-white">
        <div id="irl-documento" className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
          <div className="p-8 print:p-6 space-y-5 text-sm">

            {/* Encabezado */}
            <div className="border border-slate-300">
              <div className="bg-[#1e3a5f] text-white p-3 flex items-center justify-between">
                <Image src="/logo.png" alt="PRSO" width={100} height={40} className="object-contain" />
                <div className="text-center flex-1">
                  <div className="font-bold text-sm">GESTIÓN DE RIESGOS DE SST</div>
                  <div className="text-xs text-white/80">INFORMACIÓN DE RIESGOS LABORALES</div>
                </div>
                <div className="text-right text-xs text-white/70 space-y-0.5">
                  <div>Código: IRL-001</div>
                  <div>Fecha: {fmtFecha(irl.fecha_entrega)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 text-xs border-t border-slate-200">
                <div className="p-3 border-r border-slate-200">
                  <div className="font-semibold text-slate-500 mb-1">EMPRESA</div>
                  <div className="font-bold">{empresa?.razon_social ?? '—'}</div>
                  <div className="text-slate-500">RUT: {empresa?.rut ?? '—'}</div>
                  <div className="text-slate-500">{empresa?.actividad_economica ?? ''}</div>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-slate-500 mb-1">CENTRO DE TRABAJO</div>
                  <div className="font-bold">{centro?.nombre ?? '—'}</div>
                  <div className="text-slate-500">{centro?.direccion ?? '—'}</div>
                </div>
              </div>
            </div>

            {/* Marco normativo */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
              <strong>D.S. N° 44 — Título II, Párrafo 4, Art. 15:</strong> <em>Información de los riesgos laborales.</em>{' '}
              <strong>{empresa?.razon_social ?? '[EMPRESA]'}</strong>, en el momento de incorporarse la persona trabajadora, emite el presente documento con el objeto de cumplir la obligación de informar de los riesgos que entrañan sus labores, medidas preventivas y métodos de trabajo correctos.
            </div>

            {/* 1. Información de la actividad */}
            <SectionTitle n="1" title="Información de la Actividad" />
            <IrlTable rows={[
              ['Nombre de la actividad', irl.nombre_actividad, 'Fecha inicio — término', `${fmtFecha(irl.fecha_inicio)} — ${fmtFecha(irl.fecha_fin)}`],
              ['Modalidad', LABEL_MODALIDAD_IRL[irl.modalidad], 'N° de horas', irl.n_horas],
              ['Tipo de actividad', LABEL_TIPO_ACTIVIDAD_IRL[irl.tipo_actividad],
                irl.tipo_actividad === 'externa' ? 'Quién ejecuta' : 'Relator',
                irl.tipo_actividad === 'externa' ? irl.ejecutor_externo : `${irl.relator_nombre} (${irl.relator_cargo})`],
              ['Puesto / Grupo objetivo', irl.grupo_objetivo || tarea?.puesto_trabajo || '—', 'Proceso', proceso?.nombre ?? '—'],
            ]} />

            {/* 2. Características del lugar */}
            <SectionTitle n="2" title="Características del Lugar de Trabajo" />
            <IrlTable rows={[
              ['Espacio de trabajo', irl.espacio_trabajo || '—', '', ''],
              ['Condiciones ambientales', irl.condiciones_ambientales || '—', '', ''],
              ['Orden y aseo', irl.condiciones_orden_aseo || '—', '', ''],
              ['Máquinas y herramientas', irl.maquinas_herramientas || tarea?.equipos_involucrados || '—', '', ''],
            ]} colspanRight />

            {/* 3. Riesgos, medidas y métodos */}
            <SectionTitle n="3" title="Información de los Riesgos" />
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e3a5f] text-white">
                  <th className="px-3 py-2 text-left border border-slate-300">RIESGOS</th>
                  <th className="px-3 py-2 text-left border border-slate-300">CONSECUENCIAS</th>
                  <th className="px-3 py-2 text-left border border-slate-300">MEDIDAS DE CONTROL</th>
                  <th className="px-3 py-2 text-left border border-slate-300">MÉTODOS O PROCEDIMIENTOS DE TRABAJO</th>
                </tr>
              </thead>
              <tbody>
                {miperRows.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-slate-400 py-4">Sin riesgos registrados en MIPER</td></tr>
                ) : miperRows.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? '' : 'bg-slate-50'}>
                    <td className="px-3 py-2 border border-slate-200">
                      <div className="font-medium">{m.peligro}</div>
                      <div className="text-slate-500">{m.riesgo}</div>
                    </td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-700">
                      {m.dano_probable || '—'}
                    </td>
                    <td className="px-3 py-2 border border-slate-200">{m.medida_control || '—'}</td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-600">
                      {m.tipo_control ? LABEL_CONTROL[m.tipo_control] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 4. Material de complemento */}
            {irl.material_complemento && irl.materiales_json.length > 0 && (
              <>
                <SectionTitle n="4" title="Material de Complemento" />
                <IrlTable rows={irl.materiales_json.map(m => [m.nombre, m.tipo, '', ''])} />
              </>
            )}

            {/* 5. Participante y firma */}
            <SectionTitle n="5" title="Información del Participante" />
            <IrlTable rows={[
              ['Nombre del trabajador', irl.nombre_trabajador, 'RUT', irl.rut_trabajador],
              ['Cargo', irl.cargo_trabajador, 'Motivo', LABEL_MOTIVO_IRL[irl.motivo]],
              ['Fecha de entrega', fmtFecha(irl.fecha_entrega), '', ''],
            ]} />

            {/* Firma */}
            <div className="border border-slate-300 rounded p-4 mt-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="border-b border-slate-400 h-12 mb-2" />
                  <div className="text-xs text-slate-600 font-semibold">FIRMA DEL TRABAJADOR</div>
                  <div className="text-xs text-slate-500">{irl.nombre_trabajador}</div>
                  <div className="text-xs text-slate-500">{irl.cargo_trabajador}</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 h-12 mb-2" />
                  <div className="text-xs text-slate-600 font-semibold">FIRMA DEL RELATOR</div>
                  <div className="text-xs text-slate-500">{irl.relator_nombre}</div>
                  <div className="text-xs text-slate-500">{irl.relator_cargo}</div>
                </div>
              </div>
            </div>

            {/* Pie */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              Generado por App MIPER · DS 44 · Ley 16.744 · {new Date().toLocaleDateString('es-CL')}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Componentes auxiliares del viewer ───────────────────────────────────────

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-[#1e3a5f] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
        {n}
      </div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
    </div>
  )
}

function IrlTable({
  rows, colspanRight = false,
}: {
  rows: [string, string, string, string][]
  colspanRight?: boolean
}) {
  return (
    <table className="w-full border-collapse text-xs">
      <tbody>
        {rows.map(([k1, v1, k2, v2], i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
            <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-600 w-36 bg-slate-50">
              {k1}
            </td>
            <td className={`px-3 py-2 border border-slate-200 ${colspanRight || !k2 ? 'col-span-3' : ''}`}
              colSpan={colspanRight || !k2 ? 3 : 1}>
              {v1 || '—'}
            </td>
            {!colspanRight && k2 && (
              <>
                <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-600 w-36 bg-slate-50">{k2}</td>
                <td className="px-3 py-2 border border-slate-200">{v2 || '—'}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function IrlPage() {
  const inicializar    = useAppStore(s => s.inicializar)
  const inicializado   = useAppStore(s => s.inicializado)
  const cargando       = useAppStore(s => s.cargando)
  const empresa        = useAppStore(s => s.empresa)
  const centro         = useAppStore(s => s.centro)
  const procesos       = useAppStore(s => s.procesos)
  const tareas         = useAppStore(s => s.tareas)
  const miperRegistros = useAppStore(s => s.miperRegistros)
  const irlRegistros   = useAppStore(s => s.irlRegistros)
  const addIrl         = useAppStore(s => s.addIrl)
  const updateIrl      = useAppStore(s => s.updateIrl)
  const removeIrl      = useAppStore(s => s.removeIrl)
  const miperByTarea   = useAppStore(s => s.miperByTarea)

  useEffect(() => { inicializar() }, [inicializar])

  const [procesoFiltro, setProcesoFiltro] = useState('')
  const [tareaFiltro,   setTareaFiltro]   = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editando,      setEditando]      = useState<IrlRegistro | null>(null)
  const [viendo,        setViendo]        = useState<IrlRegistro | null>(null)
  const [confirmDel,    setConfirmDel]    = useState<string | null>(null)

  // Tareas filtradas por proceso
  const tareasFiltradas = procesoFiltro
    ? tareas.filter(t => {
        const p = procesos.find(pr => pr.id === t.proceso_id)
        return p?.id === procesoFiltro
      })
    : tareas

  // IRL filtrados
  const irlFiltrados = irlRegistros.filter(r => {
    if (tareaFiltro) return r.tarea_id === tareaFiltro
    if (procesoFiltro) return tareasFiltradas.some(t => t.id === r.tarea_id)
    return true
  })

  // Tarea seleccionada para nuevo IRL
  const tareaSeleccionada = tareaFiltro
    ? tareas.find(t => t.id === tareaFiltro)
    : tareas[0]

  if (!inicializado) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-sm">Cargando…</div>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Completa primero el módulo de Levantamiento.
      </div>
    )
  }

  // Vista de impresión
  if (viendo) {
    const tarea   = tareas.find(t => t.id === viendo.tarea_id)
    const proceso = procesos.find(p => p.id === tarea?.proceso_id)
    const miper   = miperByTarea(viendo.tarea_id)
    return (
      <IrlViewer
        irl={viendo} tarea={tarea} proceso={proceso}
        empresa={empresa} centro={centro} miperRows={miper}
        onClose={() => setViendo(null)}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🔔 Información de Riesgos Laborales</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            DS 44 · Art. 15 — Obligación de Informar (Charla ODI)
          </p>
        </div>
        <button
          onClick={() => { setEditando(null); setModalOpen(true) }}
          className="btn-primary text-sm px-4 py-2 shrink-0"
          disabled={tareas.length === 0}
        >
          + Nuevo IRL
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select className="input max-w-xs text-sm"
          value={procesoFiltro}
          onChange={e => { setProcesoFiltro(e.target.value); setTareaFiltro('') }}>
          <option value="">Todos los procesos</option>
          {procesos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <select className="input max-w-xs text-sm"
          value={tareaFiltro}
          onChange={e => setTareaFiltro(e.target.value)}>
          <option value="">Todas las tareas</option>
          {tareasFiltradas.map(t => (
            <option key={t.id} value={t.id}>{t.actividad} — {t.puesto_trabajo}</option>
          ))}
        </select>
      </div>

      {/* Lista de IRL */}
      {cargando ? (
        <div className="text-slate-400 text-sm text-center py-12">Cargando…</div>
      ) : irlFiltrados.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-slate-500 text-sm font-medium">No hay registros IRL</p>
          <p className="text-slate-400 text-xs mt-1">
            Crea el primero para documentar la Obligación de Informar a trabajadores.
          </p>
          <button
            onClick={() => { setEditando(null); setModalOpen(true) }}
            className="btn-primary mt-4 text-sm px-5 py-2"
            disabled={tareas.length === 0}
          >
            + Nuevo IRL
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {irlFiltrados.map(irl => {
            const tarea   = tareas.find(t => t.id === irl.tarea_id)
            const proceso = procesos.find(p => p.id === tarea?.proceso_id)
            const nMiper  = miperByTarea(irl.tarea_id).length

            return (
              <div key={irl.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-slate-800">
                        👷 {irl.nombre_trabajador || 'Sin nombre'}
                      </span>
                      <span className="text-[10px] bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full">
                        {LABEL_MOTIVO_IRL[irl.motivo]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      <div>📋 <span className="font-medium">{irl.nombre_actividad}</span></div>
                      {tarea && (
                        <div>⚙️ {tarea.actividad} — {tarea.puesto_trabajo}
                          {proceso && <span className="text-slate-400"> · {proceso.nombre}</span>}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <span>📅 Entrega: {fmtFecha(irl.fecha_entrega)}</span>
                        <span>⚠️ {nMiper} riesgo{nMiper !== 1 ? 's' : ''} MIPER</span>
                        <span>🎓 {LABEL_MODALIDAD_IRL[irl.modalidad]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setViendo(irl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700
                                 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      🖨️ Ver / Imprimir
                    </button>
                    <button
                      onClick={() => { setEditando(irl); setModalOpen(true) }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600
                                 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => setConfirmDel(irl.id)}
                      className="px-2.5 py-1.5 text-red-400 border border-red-200 rounded-lg
                                 text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* Riesgos preview */}
                {nMiper > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                      Riesgos informados
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {miperByTarea(irl.tarea_id).slice(0, 5).map(m => (
                        <span key={m.id}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {m.factor_riesgo || '—'} {m.peligro?.substring(0, 20)}
                        </span>
                      ))}
                      {nMiper > 5 && (
                        <span className="text-[10px] text-slate-400">+{nMiper - 5} más</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {irlRegistros.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: 'IRL emitidos', value: irlRegistros.length, color: 'text-blue-600' },
            { label: 'Trabajadores nuevos', value: irlRegistros.filter(r => r.motivo === 'nuevo').length, color: 'text-green-600' },
            { label: 'Tareas cubiertas', value: new Set(irlRegistros.map(r => r.tarea_id)).size, color: 'text-amber-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulario */}
      {modalOpen && (
        <IrlFormModal
          tareaId={editando?.tarea_id ?? tareaFiltro ?? tareas[0]?.id ?? ''}
          miperRows={miperByTarea(editando?.tarea_id ?? tareaFiltro ?? tareas[0]?.id ?? '')}
          tarea={tareas.find(t => t.id === (editando?.tarea_id ?? tareaFiltro ?? tareas[0]?.id))}
          initial={editando ?? undefined}
          onSave={async (data) => {
            if (editando) {
              await updateIrl(editando.id, data)
            } else {
              await addIrl(data)
            }
          }}
          onClose={() => { setModalOpen(false); setEditando(null) }}
        />
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-slate-800 mb-2">¿Eliminar IRL?</h3>
            <p className="text-sm text-slate-500 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => { removeIrl(confirmDel); setConfirmDel(null) }}
                className="btn-primary bg-red-600 hover:bg-red-700 text-sm px-4 py-2">
                Eliminar
              </button>
              <button onClick={() => setConfirmDel(null)} className="btn-secondary text-sm px-4 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
