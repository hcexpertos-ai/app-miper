'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/src/store/app-store'
import Modal from '@/components/Modal'
import type {
  PtsRegistro, MiperRegistro, Tarea, Proceso, Empresa, CentroTrabajo,
} from '@/src/types'
import { LABEL_CONTROL, COLOR_RIESGO } from '@/src/types'
import type { ClasificacionRiesgo } from '@/src/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoy = () => new Date().toISOString().split('T')[0]
const fmtFecha = (iso: string) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('es-CL') : '—'
const añoActual = new Date().getFullYear()

// ─── Formulario vacío (con auto-populate) ────────────────────────────────────

function formVacio(
  tareaId: string,
  tarea?: Tarea,
  empresa?: Empresa | null,
  idx = 1,
): Omit<PtsRegistro, 'id' | 'created_at'> {
  const nombre = tarea?.actividad ?? '[Nombre de la Tarea]'
  const razon  = empresa?.razon_social ?? '[Nombre de la Empresa]'
  return {
    tarea_id:          tareaId,
    codigo:            `PTS-${String(idx).padStart(3, '0')}-${añoActual}`,
    version:           '01',
    objetivo:               `Establecer un estándar operativo y metodológico sistemático para la ejecución segura de las tareas de ${nombre}, identificando de forma proactiva los peligros y evaluando los riesgos asociados, con el fin de implementar medidas de control que resguarden la integridad física y salud ocupacional de los trabajadores, en cumplimiento del marco legal vigente.`,
    alcance:                `Este procedimiento es de cumplimiento obligatorio y aplica a todo el personal propio, subcontratado y contratistas que ejecuten las actividades de ${nombre} en las instalaciones de ${razon}.`,
    descripcion_actividad:  tarea?.descripcion_tarea
      ? `${tarea.descripcion_tarea}\n\nEste procedimiento se elabora con el propósito de garantizar que la actividad "${nombre}" se ejecute de manera segura y estandarizada, estableciendo los pasos metodológicos necesarios, las medidas de control aplicables y los responsables de su cumplimiento, en estricto apego a la normativa vigente de prevención de riesgos laborales.`
      : `Describir los pasos y actividades involucradas en la ejecución de "${nombre}", señalando los riesgos potenciales y las medidas de control requeridas para garantizar la seguridad de todos los trabajadores que participen en esta labor.\n\nEste procedimiento se elabora con el fin de dar cumplimiento a los requerimientos legales establecidos en el D.S. N° 44, Ley N° 16.744 y demás normativa aplicable, asegurando una metodología de trabajo segura y documentada.`,
    epp_basico:        '• Casco de seguridad con barbiquejo.\n• Calzado de seguridad dieléctrico/anticorte.\n• Lentes de seguridad con protección UV.\n• Chaleco de alta visibilidad (D.S. 594).',
    epp_especifico:    '',
    elaborado_nombre:  '',
    elaborado_cargo:   'Asesor en Prevención de Riesgos',
    elaborado_fecha:   hoy(),
    revisado_nombre:   '',
    revisado_cargo:    'Experto en Prevención de Riesgos',
    revisado_fecha:    hoy(),
    aprobado_nombre:   '',
    aprobado_cargo:    'Gerente / Administrador',
    aprobado_fecha:    hoy(),
    fecha_elaboracion: hoy(),
  }
}

// ─── Secciones del formulario ─────────────────────────────────────────────────

const SECCIONES = [
  { id: 'encabezado',  label: '1. Encabezado',   icon: '📋' },
  { id: 'epp',         label: '2. EPP',           icon: '🦺' },
  { id: 'riesgos',     label: '3. Riesgos MIPER', icon: '⚠️' },
  { id: 'validacion',  label: '4. Validación',    icon: '✍️' },
] as const

type SeccionId = typeof SECCIONES[number]['id']

// ─── Modal Formulario ─────────────────────────────────────────────────────────

function PtsFormModal({
  tareaId, tarea, empresa, miperRows,
  initial, onSave, onClose,
}: {
  tareaId:   string
  tarea:     Tarea | undefined
  empresa:   Empresa | null
  miperRows: MiperRegistro[]
  initial?:  PtsRegistro
  onSave:    (data: Omit<PtsRegistro, 'id' | 'created_at'>) => Promise<void>
  onClose:   () => void
}) {
  const ptsCount = useAppStore(s => s.ptsRegistros.filter(p => p.tarea_id === tareaId).length)
  const [form, setForm]       = useState<Omit<PtsRegistro, 'id' | 'created_at'>>(
    initial ? { ...initial } : formVacio(tareaId, tarea, empresa, ptsCount + 1)
  )
  const [seccion, setSeccion] = useState<SeccionId>('encabezado')
  const [guardando, setGuardando] = useState(false)
  const [err, setErr]         = useState('')

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(s => ({ ...s, [k]: v }))

  async function handleSave() {
    if (!form.codigo.trim()) { setErr('El código es obligatorio.'); return }
    setGuardando(true); setErr('')
    try { await onSave(form); onClose() }
    catch (e) { setErr((e as Error).message) }
    finally { setGuardando(false) }
  }

  return (
    <Modal
      title={initial ? 'Editar PTS' : 'Nuevo Procedimiento de Trabajo Seguro'}
      onClose={onClose}
      size="lg"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 pb-0 -mt-1 overflow-x-auto">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors
              ${seccion === s.id
                ? 'bg-[#1e3a5f] text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* ── Sección 1: Encabezado ── */}
      {seccion === 'encabezado' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Código *</label>
              <input className="input" value={form.codigo}
                onChange={e => set('codigo', e.target.value)} placeholder="PTS-001-2026" />
            </div>
            <div>
              <label className="label">Versión</label>
              <input className="input" value={form.version}
                onChange={e => set('version', e.target.value)} placeholder="01" />
            </div>
            <div>
              <label className="label">Fecha de Elaboración</label>
              <input type="date" className="input" value={form.fecha_elaboracion}
                onChange={e => set('fecha_elaboracion', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Objetivo</label>
            <textarea rows={4} className="input resize-none" value={form.objetivo}
              onChange={e => set('objetivo', e.target.value)} />
          </div>
          <div>
            <label className="label">Alcance</label>
            <textarea rows={3} className="input resize-none" value={form.alcance}
              onChange={e => set('alcance', e.target.value)} />
          </div>
          <div>
            <label className="label">Descripción de la Actividad y Motivo del Procedimiento</label>
            <textarea rows={5} className="input resize-none" value={form.descripcion_actividad}
              onChange={e => set('descripcion_actividad', e.target.value)}
              placeholder="Describir las actividades a realizar y el motivo por el cual se elabora este procedimiento…" />
          </div>
        </div>
      )}

      {/* ── Sección 2: EPP ── */}
      {seccion === 'epp' && (
        <div className="space-y-4">
          <div>
            <label className="label">EPP Básico (Obligatorio)</label>
            <textarea rows={5} className="input resize-none font-mono text-xs"
              value={form.epp_basico}
              onChange={e => set('epp_basico', e.target.value)}
              placeholder="• Casco de seguridad con barbiquejo.&#10;• Calzado de seguridad..." />
          </div>
          <div>
            <label className="label">EPP Específico (Según Tarea)</label>
            <textarea rows={4} className="input resize-none font-mono text-xs"
              value={form.epp_especifico}
              onChange={e => set('epp_especifico', e.target.value)}
              placeholder="• Arnés de seguridad de cuerpo completo.&#10;• Protector auditivo tipo fono/tapón..." />
          </div>
          {tarea?.equipos_involucrados && (
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <span className="font-semibold">Equipos del levantamiento:</span> {tarea.equipos_involucrados}
            </div>
          )}
        </div>
      )}

      {/* ── Sección 3: Riesgos (auto desde MIPER) ── */}
      {seccion === 'riesgos' && (
        <div className="space-y-3">
          <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
            <span>⚡</span>
            <span>La Secuencia Operativa se genera automáticamente desde los registros MIPER de esta tarea.</span>
          </div>
          {miperRows.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No hay registros MIPER para esta tarea.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white">
                    <th className="px-2 py-2 text-left">N°</th>
                    <th className="px-2 py-2 text-left">Peligro / Riesgo</th>
                    <th className="px-2 py-2 text-left">Daño Probable</th>
                    <th className="px-2 py-2 text-left">Medidas de Control</th>
                    <th className="px-2 py-2 text-left">Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {miperRows.map((m, i) => (
                    <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-2 py-2 border border-slate-100 text-center font-bold text-slate-500">{i + 1}</td>
                      <td className="px-2 py-2 border border-slate-100">
                        <div className="font-semibold">{m.peligro}</div>
                        <div className="text-slate-500">{m.riesgo}</div>
                      </td>
                      <td className="px-2 py-2 border border-slate-100 text-slate-600">{m.dano_probable || '—'}</td>
                      <td className="px-2 py-2 border border-slate-100">{m.medida_control || '—'}</td>
                      <td className="px-2 py-2 border border-slate-100">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${COLOR_RIESGO[m.clasificacion_riesgo as ClasificacionRiesgo]}`}>
                          {m.clasificacion_riesgo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sección 4: Validación ── */}
      {seccion === 'validacion' && (
        <div className="space-y-5">
          {([
            ['elaborado', 'Elaborado por'],
            ['revisado',  'Revisado por'],
            ['aprobado',  'Aprobado por'],
          ] as const).map(([prefix, title]) => (
            <div key={prefix} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest">{title}</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Nombre</label>
                  <input className="input" value={form[`${prefix}_nombre`]}
                    onChange={e => set(`${prefix}_nombre`, e.target.value)} />
                </div>
                <div>
                  <label className="label">Cargo</label>
                  <input className="input" value={form[`${prefix}_cargo`]}
                    onChange={e => set(`${prefix}_cargo`, e.target.value)} />
                </div>
                <div>
                  <label className="label">Fecha</label>
                  <input type="date" className="input" value={form[`${prefix}_fecha`]}
                    onChange={e => set(`${prefix}_fecha`, e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {err && <p className="text-xs text-red-600 mt-3">{err}</p>}

      {/* Botones navegación */}
      <div className="flex justify-between mt-5 pt-4 border-t border-slate-200">
        <div className="flex gap-2">
          {SECCIONES.findIndex(s => s.id === seccion) > 0 && (
            <button onClick={() => {
              const idx = SECCIONES.findIndex(s => s.id === seccion)
              setSeccion(SECCIONES[idx - 1].id)
            }} className="btn-secondary text-sm px-3 py-2">← Anterior</button>
          )}
          {SECCIONES.findIndex(s => s.id === seccion) < SECCIONES.length - 1 && (
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
            {guardando ? 'Guardando…' : initial ? '💾 Actualizar' : '💾 Guardar PTS'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Visor imprimible ─────────────────────────────────────────────────────────

function PtsViewer({
  pts, tarea, proceso, empresa, centro, miperRows, onClose,
}: {
  pts:       PtsRegistro
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
      const { exportarPtsWord } = await import('./generate-word')
      await exportarPtsWord(pts, { tarea, proceso, empresa, centro, miperRows })
    } finally { setDescargandoWord(false) }
  }

  // Sección helper
  const SecTitle = ({ n, title }: { n: string; title: string }) => (
    <div className="flex items-center gap-2 mt-5 mb-2">
      <div className="bg-[#1e3a5f] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{n}</div>
      <h3 className="font-bold text-[#1e3a5f] text-sm uppercase tracking-wide">{title}</h3>
    </div>
  )

  const RowTable = ({ rows }: { rows: [string, string][] }) => (
    <table className="w-full border-collapse text-xs mb-1">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
            <td className="px-3 py-1.5 border border-slate-200 font-semibold text-slate-600 w-48 bg-slate-50">{k}</td>
            <td className="px-3 py-1.5 border border-slate-200">{v || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <>
      {/* Barra de acción */}
      <div className="print:hidden fixed top-0 inset-x-0 z-50 bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">{pts.codigo} — {tarea?.actividad}</span>
        <div className="flex gap-2">
          <button onClick={handleWord} disabled={descargandoWord}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5">
            {descargandoWord ? '⏳' : '📝'} {descargandoWord ? 'Generando…' : 'Word'}
          </button>
          <button onClick={() => window.print()}
            className="bg-white text-[#1e3a5f] text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50">
            🖨️ Imprimir / PDF
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white text-sm px-2">✕ Cerrar</button>
        </div>
      </div>

      {/* Documento */}
      <div className="print:pt-0 pt-16 min-h-screen bg-slate-100 print:bg-white">
        <div id="pts-documento" className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
          <div className="p-8 print:p-6 space-y-4 text-sm">

            {/* ── Encabezado ── */}
            <div className="border border-slate-300">
              <div className="bg-[#1e3a5f] text-white p-3 flex items-center justify-between">
                <Image src="/logo.png" alt="PRSO" width={100} height={40} className="object-contain" />
                <div className="text-center flex-1">
                  <div className="font-bold text-sm">PROCEDIMIENTO DE TRABAJO SEGURO (PTS)</div>
                  <div className="text-xs text-white/80">{tarea?.actividad ?? '—'}</div>
                </div>
                <div className="text-right text-xs text-white/70 space-y-0.5">
                  <div>Código: {pts.codigo}</div>
                  <div>Versión: {pts.version}</div>
                  <div>Fecha: {fmtFecha(pts.fecha_elaboracion)}</div>
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

            {/* ── Marco normativo ── */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 text-xs text-blue-900">
              <strong>D.S. N° 44 · Ley N° 16.744 · Ley N° 21.643 · D.S. N° 594</strong> — {empresa?.razon_social ?? '[Empresa]'} emite el presente Procedimiento de Trabajo Seguro para garantizar la ejecución correcta de <em>{tarea?.actividad}</em>, resguardando la integridad física y la salud ocupacional de los trabajadores.
            </div>

            {/* ── 1. Objetivo ── */}
            <SecTitle n="1" title="Objetivo" />
            <p className="text-xs text-slate-700 leading-relaxed">{pts.objetivo}</p>

            {/* ── 2. Alcance ── */}
            <SecTitle n="2" title="Alcance" />
            <p className="text-xs text-slate-700 leading-relaxed">{pts.alcance}</p>

            {/* ── 3. Descripción de la Actividad ── */}
            <SecTitle n="3" title="Descripción de la Actividad y Motivo del Procedimiento" />
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {pts.descripcion_actividad || '—'}
            </div>

            {/* ── 4. Responsabilidades ── */}
            <SecTitle n="4" title="Responsabilidades" />
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e3a5f] text-white">
                  <th className="px-3 py-2 text-left border border-slate-300 w-48">Rol</th>
                  <th className="px-3 py-2 text-left border border-slate-300">Responsabilidad</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Gerencia / Administración', 'Proveer recursos e impulsar el cumplimiento del marco regulatorio laboral y de SST.'],
                  ['Supervisor / Jefe de Terreno', 'Liderar la aplicación del procedimiento, verificar EPP y capacitación, detener trabajos inseguros.'],
                  ['Asesor en Prevención (HSE)', 'Asesoría técnica, inspecciones periódicas y validación normativa del procedimiento.'],
                  ['Trabajadores / Ejecutantes', 'Cumplir la secuencia operativa, usar EPP y reportar de inmediato toda condición o acto subestándar.'],
                ].map(([rol, resp], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-700 bg-slate-50">{rol}</td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-600">{resp}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── 5. Definiciones Legales y Técnicas ── */}
            <SecTitle n="5" title="Definiciones Legales y Técnicas" />
            <div className="border border-slate-200 rounded text-xs divide-y divide-slate-100">
              {([
                ['Accidente del Trabajo',        'Toda lesión que una persona sufra a causa o con ocasión del trabajo, y que le produzca incapacidad o muerte (Art. 5, Ley N° 16.744).'],
                ['Accidente de Trayecto',         'Ocurridos en el trayecto directo, de ida o regreso, entre la habitación y el lugar del trabajo, o entre dos lugares de trabajo distintos (Art. 5, Ley N° 16.744).'],
                ['Enfermedad Profesional',        'La causada de manera directa por el ejercicio de la profesión o el trabajo que realice una persona y que le produzca incapacidad o muerte (Art. 7, Ley N° 16.744).'],
                ['Acoso y Violencia en el Trabajo','Conductas que constituyan agresión u hostigamiento reiterado (acoso laboral), no reiterado (acoso sexual) o violencia ejercida por terceros. Deben garantizarse entornos libres de violencia (Ley N° 21.643).'],
                ['Elemento de Protección Personal (EPP)', 'Todo equipo, aparato o dispositivo fabricado para preservar el cuerpo humano, en todo o en parte, de riesgos específicos de accidentes del trabajo o enfermedades profesionales (D.S. N° 594).'],
                ['Peligro',                       'Fuente, situación o acto con potencial para causar daño humano, deterioro de la salud, o daños materiales a los equipos e instalaciones.'],
                ['Riesgo',                        'Probabilidad de que un peligro se materialice en determinadas condiciones y produzca daños. Su evaluación estima la magnitud de los riesgos para decidir si son tolerables.'],
                ['Incidente',                     'Evento relacionado con el trabajo en el que ocurrió o pudo haber ocurrido lesión, enfermedad o fatalidad. Si no genera daños ni lesiones, se denomina cuasi accidente.'],
                ['Acción Subestándar',            'Todo acto u omisión del trabajador que viola un procedimiento o normativa de seguridad.'],
                ['Condición Subestándar',         'Desviación en el entorno físico o en los equipos que representa un peligro para las personas o las instalaciones.'],
              ] as [string, string][]).map(([term, def], i) => (
                <div key={i} className={`flex gap-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className="px-3 py-2 font-semibold text-[#1e3a5f] w-56 shrink-0 border-r border-slate-200">{term}</div>
                  <div className="px-3 py-2 text-slate-600 leading-relaxed">{def}</div>
                </div>
              ))}
            </div>

            {/* ── 6. EPP ── */}
            <SecTitle n="6" title="Equipos, Herramientas y EPP" />
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e3a5f] text-white">
                  <th className="px-3 py-2 text-left border border-slate-300 w-48">Tipo de EPP</th>
                  <th className="px-3 py-2 text-left border border-slate-300">Elementos Requeridos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-700 bg-slate-50 align-top">EPP Básico (Obligatorio)</td>
                  <td className="px-3 py-2 border border-slate-200 whitespace-pre-line text-slate-700">{pts.epp_basico || '—'}</td>
                </tr>
                {pts.epp_especifico && (
                  <tr className="bg-slate-50">
                    <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-700 bg-slate-50 align-top">EPP Específico (Tarea)</td>
                    <td className="px-3 py-2 border border-slate-200 whitespace-pre-line text-slate-700">{pts.epp_especifico}</td>
                  </tr>
                )}
                {tarea?.equipos_involucrados && (
                  <tr className="bg-white">
                    <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-700 bg-slate-50 align-top">Equipos / Herramientas</td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-700">{tarea.equipos_involucrados}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ── 7. Secuencia Operativa (desde MIPER) ── */}
            <SecTitle n="7" title="Secuencia Operativa Segura y Evaluación de Riesgos" />
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e3a5f] text-white">
                  <th className="px-2 py-2 text-center border border-slate-300 w-8">N°</th>
                  <th className="px-3 py-2 text-left border border-slate-300">Peligro / Riesgo</th>
                  <th className="px-3 py-2 text-left border border-slate-300">Daño Probable</th>
                  <th className="px-3 py-2 text-left border border-slate-300">Medidas de Control / Estándar Seguro</th>
                  <th className="px-3 py-2 text-center border border-slate-300 w-24">Jerarquía</th>
                  <th className="px-3 py-2 text-center border border-slate-300 w-20">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {miperRows.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-4">Sin riesgos en MIPER</td></tr>
                ) : miperRows.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? '' : 'bg-slate-50'}>
                    <td className="px-2 py-2 border border-slate-200 text-center font-bold text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 border border-slate-200">
                      <div className="font-semibold">{m.peligro}</div>
                      <div className="text-slate-500">{m.riesgo}</div>
                    </td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-600">{m.dano_probable || '—'}</td>
                    <td className="px-3 py-2 border border-slate-200">{m.medida_control || '—'}</td>
                    <td className="px-3 py-2 border border-slate-200 text-center text-xs text-slate-600">
                      {m.tipo_control ? LABEL_CONTROL[m.tipo_control] : '—'}
                    </td>
                    <td className="px-2 py-2 border border-slate-200 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${COLOR_RIESGO[m.clasificacion_riesgo as ClasificacionRiesgo]}`}>
                        {String(m.clasificacion_riesgo).charAt(0).toUpperCase() + String(m.clasificacion_riesgo).slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── 8. Marco Legal ── */}
            <SecTitle n="8" title="Marco Legal y Referencias Normativas" />
            <ul className="text-xs text-slate-700 space-y-1 list-none pl-0">
              {[
                ['Ley N° 16.744', 'Establece Normas sobre Accidentes del Trabajo y Enfermedades Profesionales.'],
                ['Ley N° 21.643', 'Prevención, investigación y sanción del acoso laboral, sexual y violencia en el trabajo.'],
                ['D.S. N° 594',   'Reglamento sobre Condiciones Sanitarias y Ambientales Básicas en los Lugares de Trabajo.'],
                ['D.S. N° 44',    'Reglamento sobre requisitos para la exención, rebaja y recargo de la cotización adicional diferenciada.'],
              ].map(([ley, desc]) => (
                <li key={ley} className="flex gap-2">
                  <span className="font-bold text-[#1e3a5f] shrink-0">{ley}</span>
                  <span className="text-slate-600">— {desc}</span>
                </li>
              ))}
            </ul>

            {/* ── 9. Validación ── */}
            <SecTitle n="9" title="Cuadro de Responsabilidades y Validación" />
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e3a5f] text-white">
                  <th className="px-3 py-2 text-center border border-slate-300">Elaborado por</th>
                  <th className="px-3 py-2 text-center border border-slate-300">Revisado por</th>
                  <th className="px-3 py-2 text-center border border-slate-300">Aprobado por</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {(['elaborado', 'revisado', 'aprobado'] as const).map(prefix => (
                    <td key={prefix} className="px-3 py-4 border border-slate-200 text-center align-bottom">
                      <div className="border-b border-slate-400 h-10 mb-2 mx-4" />
                      <div className="font-semibold text-slate-700">{pts[`${prefix}_nombre`] || '—'}</div>
                      <div className="text-slate-500">{pts[`${prefix}_cargo`]}</div>
                      <div className="text-slate-400">{fmtFecha(pts[`${prefix}_fecha`])}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* ── Pie ── */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              Generado por App MIPER · DS 44 · Ley 16.744 · {new Date().toLocaleDateString('es-CL')}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PtsPage() {
  const inicializar   = useAppStore(s => s.inicializar)
  const inicializado  = useAppStore(s => s.inicializado)
  const cargando      = useAppStore(s => s.cargando)
  const empresa       = useAppStore(s => s.empresa)
  const centro        = useAppStore(s => s.centro)
  const procesos      = useAppStore(s => s.procesos)
  const tareas        = useAppStore(s => s.tareas)
  const ptsRegistros  = useAppStore(s => s.ptsRegistros)
  const addPts        = useAppStore(s => s.addPts)
  const updatePts     = useAppStore(s => s.updatePts)
  const removePts     = useAppStore(s => s.removePts)
  const ptsByTarea    = useAppStore(s => s.ptsByTarea)
  const miperByTarea  = useAppStore(s => s.miperByTarea)
  const error         = useAppStore(s => s.error)
  const limpiarError  = useAppStore(s => s.limpiarError)

  useEffect(() => { inicializar() }, [inicializar])

  const [procesoFiltro, setProcesoFiltro] = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editando,      setEditando]      = useState<PtsRegistro | null>(null)
  const [tareaActual,   setTareaActual]   = useState<string>('')
  const [viendo,        setViendo]        = useState<PtsRegistro | null>(null)
  const [confirmDel,    setConfirmDel]    = useState<string | null>(null)

  if (cargando && !inicializado) return (
    <div className="p-8 text-center text-slate-400 animate-pulse">Cargando PTS…</div>
  )

  const tareasFiltradas = procesoFiltro
    ? tareas.filter(t => t.proceso_id === procesoFiltro)
    : tareas

  // PTS filtrados por tareas del proceso seleccionado
  const tareaIdsFiltradas = new Set(tareasFiltradas.map(t => t.id))
  const ptsFiltrados = ptsRegistros.filter(p => tareaIdsFiltradas.has(p.tarea_id))

  function openAdd(tareaId: string) {
    setTareaActual(tareaId); setEditando(null); setModalOpen(true)
  }
  function openEdit(pts: PtsRegistro) {
    setTareaActual(pts.tarea_id); setEditando(pts); setModalOpen(true)
  }

  async function handleSave(data: Omit<PtsRegistro, 'id' | 'created_at'>) {
    if (editando) await updatePts(editando.id, data)
    else          await addPts(data)
  }

  // Viewer mode
  if (viendo) {
    const tarea   = tareas.find(t => t.id === viendo.tarea_id)
    const proceso = procesos.find(p => p.id === tarea?.proceso_id)
    return (
      <PtsViewer
        pts={viendo}
        tarea={tarea}
        proceso={proceso}
        empresa={empresa}
        centro={centro}
        miperRows={miperByTarea(viendo.tarea_id)}
        onClose={() => setViendo(null)}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">PTS</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Módulo 5 · Procedimiento de Trabajo Seguro · DS 44 · Ley 16.744
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={limpiarError} className="ml-4 text-red-500">✕</button>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total PTS', value: ptsRegistros.length, color: 'text-[#1e3a5f]' },
          { label: 'Con riesgos MIPER', value: Array.from(new Set(ptsRegistros.map(p => p.tarea_id))).filter(id => miperByTarea(id).length > 0).length, color: 'text-amber-600' },
          { label: 'Tareas cubiertas', value: new Set(ptsRegistros.map(p => p.tarea_id)).size, color: 'text-green-600' },
          { label: 'Procesos', value: procesos.length, color: 'text-slate-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filtro proceso */}
      <div className="card p-4">
        <label className="label">Filtrar por Proceso</label>
        <select className="select max-w-md" value={procesoFiltro}
          onChange={e => setProcesoFiltro(e.target.value)}>
          <option value="">— Todos los procesos —</option>
          {procesos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {tareas.length === 0 && (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">Primero completa el Levantamiento de Procesos y Tareas.</p>
        </div>
      )}

      {/* Tarjetas por tarea */}
      {tareasFiltradas.map(tarea => {
        const proceso = procesos.find(p => p.id === tarea.proceso_id)
        const ptsList = ptsByTarea(tarea.id)
        const mipers  = miperByTarea(tarea.id)

        return (
          <div key={tarea.id} className="card overflow-hidden">
            {/* Cabecera tarea */}
            <div className="section-header">
              <div>
                <div className="font-semibold text-slate-800">{tarea.actividad}</div>
                <div className="text-xs text-slate-400">
                  {proceso?.nombre} · {tarea.puesto_trabajo} · {tarea.lugar_ejecucion}
                  {mipers.length > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">⚠️ {mipers.length} riesgo{mipers.length !== 1 ? 's' : ''} MIPER</span>
                  )}
                </div>
              </div>
              <button onClick={() => openAdd(tarea.id)} className="btn-primary text-xs px-3 py-1.5">
                + Nuevo PTS
              </button>
            </div>

            {/* Lista PTS de esta tarea */}
            {ptsList.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-400 text-center border-t border-slate-100">
                Sin PTS registrados para esta tarea.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {ptsList.map(pts => (
                  <div key={pts.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#1e3a5f] text-white text-xs font-bold px-2 py-1 rounded">
                        {pts.codigo}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          v{pts.version} · {fmtFecha(pts.fecha_elaboracion)}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{pts.objetivo.slice(0, 80)}…</div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setViendo(pts)}
                        className="btn-primary text-xs px-3 py-1.5">Ver / Imprimir</button>
                      <button onClick={() => openEdit(pts)}
                        className="btn-secondary text-xs px-2 py-1.5">Editar</button>
                      <button onClick={() => setConfirmDel(pts.id)}
                        className="btn-danger text-xs px-2 py-1.5">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Modal formulario */}
      {modalOpen && (
        <PtsFormModal
          tareaId={tareaActual}
          tarea={tareas.find(t => t.id === tareaActual)}
          empresa={empresa}
          miperRows={miperByTarea(tareaActual)}
          initial={editando ?? undefined}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditando(null) }}
        />
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <Modal title="Eliminar PTS" onClose={() => setConfirmDel(null)}>
          <p className="text-sm text-slate-600 mb-4">¿Estás seguro de eliminar este PTS? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={async () => { await removePts(confirmDel); setConfirmDel(null) }}
              className="btn-danger">Eliminar</button>
            <button onClick={() => setConfirmDel(null)} className="btn-secondary">Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
