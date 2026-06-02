'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '../../src/store/app-store'
import {
  EMERGENCIAS, CONFIG_PLAN_DEFAULT, REGIONES_CHILE,
  type ConfigPlan, type EdeItem, type PersonaDiscapacidad, type Turno, type Emergencia,
} from '../../src/lib/plan-respuesta-data'

// ─── helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder = '', type = 'text', small = false
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; small?: boolean
}) {
  return (
    <div className={small ? '' : 'flex flex-col gap-1'}>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  )
}

function Textarea({
  label, value, onChange, placeholder = '', rows = 3
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide mt-6 mb-3 pb-1 border-b border-slate-200">
      {children}
    </h3>
  )
}

// ─── Print / PDF view ─────────────────────────────────────────────────────────

function PrintView({ cfg, empresa, centro }: { cfg: ConfigPlan; empresa: any; centro: any }) {
  const total =
    (parseInt(cfg.n_propios) || 0) +
    (parseInt(cfg.n_contratistas) || 0) +
    (parseInt(cfg.n_proveedores) || 0) +
    (parseInt(cfg.n_externos) || 0) +
    (parseInt(cfg.n_visitas) || 0)

  const activas = EMERGENCIAS.filter(e => cfg.emergencias_activas[e.id] !== false)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, lineHeight: 1.45, color: '#111', maxWidth: 820, margin: '0 auto', padding: '1.5cm 2cm' }}>
      {/* ── Encabezado: franja azul con logo (logo blanco visible sobre fondo oscuro) ── */}
      <div style={{ background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="PRSO Logo" style={{ height: 52, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Plan de Respuesta ante Emergencias en Centros de Trabajo
          </div>
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.85 }}>
            {empresa?.razon_social || '[NOMBRE ENTIDAD EMPLEADORA]'}
          </div>
          <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>DS 44 · Ley N°16.744 · Metodología ACCEDER · SENAPRED</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, opacity: 0.8, whiteSpace: 'nowrap' }}>
          <div>Vigencia:</div>
          <div style={{ fontWeight: 'bold' }}>{cfg.vigencia || '—'}</div>
        </div>
      </div>

      {/* Identificación del documento */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', width: '25%', fontWeight: 'bold' }}>Código</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '25%' }}>{cfg.codigo}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', width: '25%', fontWeight: 'bold' }}>Revisión</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '25%' }}>{cfg.revision}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Versión</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.version}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Vigencia</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.vigencia}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Elaborado por</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.elaborado_por}<br /><span style={{ color: '#888', fontSize: 10 }}>{cfg.cargo_elaborado} — {cfg.fecha_elaboracion}</span></td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Revisado por</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.revisado_por}<br /><span style={{ color: '#888', fontSize: 10 }}>{cfg.cargo_revisado} — {cfg.fecha_revision}</span></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Aprobado por</td>
            <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.aprobado_por}<br /><span style={{ color: '#888', fontSize: 10 }}>{cfg.cargo_aprobado} — {cfg.fecha_aprobacion}</span></td>
          </tr>
        </tbody>
      </table>

      {/* Introducción */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>Introducción</h2>
      <p style={{ marginBottom: 12 }}>
        El presente documento establece las medidas y procedimientos de actuación de <strong>{empresa?.razon_social || '[ENTIDAD EMPLEADORA]'}</strong> para responder a las situaciones de emergencia o desastre que puedan materializarse en sus centros de trabajo. Está basado en la metodología ACCEDER del SENAPRED y en las guías para la implementación del plan para la reducción del riesgo de desastres en centros de trabajo.
      </p>

      {/* 1. Información del plan */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>1. Información del Plan</h2>
      <p><strong>Descripción:</strong> Conjunto de medios y procedimientos de actuación de {empresa?.razon_social || '[ENTIDAD EMPLEADORA]'} dirigidos a responder a las potenciales situaciones de emergencia en sus centros de trabajo.</p>
      <p style={{ marginTop: 6 }}><strong>Alcance:</strong> Este plan aplica al centro de trabajo <strong>{cfg.nombre_centro || '[NOMBRE CENTRO]'}</strong> de <strong>{empresa?.razon_social || '[ENTIDAD EMPLEADORA]'}</strong>, considerando trabajadores propios, contratistas, clientes y usuarios.</p>

      {/* 4. Funciones y responsabilidades */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>4. Funciones y Responsabilidades</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', width: '35%', fontWeight: 'bold' }}>Líder de Respuesta del Centro (LRC) Titular</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.lrc_titular || '—'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Líder de Respuesta del Centro (LRC) Suplente</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.lrc_suplente || '—'}</td>
          </tr>
        </tbody>
      </table>
      {cfg.ede.length > 0 && (
        <>
          <p style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 4 }}>Encargados de Evacuación (EDE):</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10, fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                {['Titular', 'Suplente', 'Área/Sección', 'Zona de Seguridad', 'N° Personas'].map(h => (
                  <th key={h} style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfg.ede.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                  <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{r.titular || '—'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{r.suplente || '—'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{r.area || '—'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{r.zona_seguridad || '—'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{r.n_personas || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* 5. Antecedentes de las instalaciones */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>5. Antecedentes de las Instalaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', width: '30%', fontWeight: 'bold' }}>Nombre Entidad Empleadora</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{empresa?.razon_social || '—'}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', width: '20%', fontWeight: 'bold' }}>RUT</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{empresa?.rut || '—'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Nombre Centro de Trabajo</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.nombre_centro || '—'}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Tipo</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.tipo_centro}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Dirección</td>
            <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.direccion} {cfg.numero}, {cfg.comuna}, {cfg.region}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Entorno</td>
            <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cfg.descripcion_entorno || '—'}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontWeight: 'bold', marginBottom: 4 }}>Carga Ocupacional:</p>
      <table style={{ width: '60%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <tbody>
          {[
            ['Trabajadores propios', cfg.n_propios],
            ['Contratistas', cfg.n_contratistas],
            ['Proveedores', cfg.n_proveedores],
            ['Externos / independientes', cfg.n_externos],
            ['Visitas / clientes / usuarios', cfg.n_visitas],
            ['Total', String(total || '—')],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ border: '1px solid #ccc', padding: '3px 8px', background: '#f0f4f8', fontWeight: k === 'Total' ? 'bold' : 'normal' }}>{k}</td>
              <td style={{ border: '1px solid #ccc', padding: '3px 8px', fontWeight: k === 'Total' ? 'bold' : 'normal' }}>{v || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Planificación ACCEDER */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>Planificación de la Respuesta — Metodología ACCEDER</h2>

      <p style={{ fontWeight: 'bold', marginBottom: 2 }}>Alerta y Alarma</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <tbody>
          {[
            ['Encargado de alertas', cfg.encargado_alerta],
            ['Cómo se validará la alerta', cfg.validacion_alerta],
            ['Acciones al validar la alerta', cfg.acciones_alerta],
            ['Encargado de generar la alarma', cfg.encargado_alarma],
            ['Tipo de alarma', cfg.tipo_alarma],
            ['Cómo se dará la alarma', cfg.como_alarma],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ border: '1px solid #ccc', padding: '3px 8px', background: '#f0f4f8', width: '35%', fontWeight: 'bold' }}>{k}</td>
              <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{v || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontWeight: 'bold', marginBottom: 2 }}>Comunicaciones</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px', background: '#f0f4f8', width: '35%', fontWeight: 'bold' }}>Encargado comunicaciones internas</td>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{cfg.encargado_com_interna || '—'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Encargado comunicaciones externas</td>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{cfg.encargado_com_externa || '—'}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontWeight: 'bold', marginBottom: 2 }}>Zonas de Seguridad</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px', background: '#f0f4f8', width: '35%', fontWeight: 'bold' }}>Zona de seguridad interna</td>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{cfg.zona_seguridad_interna || '—'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px', background: '#f0f4f8', fontWeight: 'bold' }}>Zona de seguridad externa</td>
            <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{cfg.zona_seguridad_externa || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* Procedimientos por amenaza */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>Procedimientos de Actuación por Amenaza</h2>
      <p style={{ marginBottom: 12, fontSize: 10, color: '#666' }}>
        Amenazas activas en este plan: {activas.map(e => e.nombre).join(', ')}
      </p>

      {activas.map(em => (
        <div key={em.id} style={{ marginBottom: 20, pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: 12, color: '#fff', background: '#1e3a5f', padding: '4px 10px', marginBottom: 0 }}>
            {em.icono} {em.nombre}
          </h3>
          {em.info_contexto && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '6px 10px', fontSize: 10, marginBottom: 4 }}>
              <strong>Contexto:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16 }}>
                {em.info_contexto.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {[
            { rol: 'Líder de Respuesta del Centro (LRC)', steps: em.procedimiento_lrc, bg: '#e8f0fe' },
            { rol: 'Encargado de Evacuación (EDE)', steps: em.procedimiento_ede, bg: '#e6f4ea' },
            { rol: 'Personas en General (PG)', steps: em.procedimiento_pg, bg: '#fce8e6' },
          ].map(({ rol, steps, bg }) => (
            <div key={rol} style={{ border: '1px solid #ddd', borderTop: 'none', padding: '6px 10px', background: bg }}>
              <p style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 4 }}>{rol}</p>
              <ol style={{ margin: 0, paddingLeft: 16, fontSize: 10 }}>
                {steps.map((s, i) => <li key={i} style={{ marginBottom: 2 }}>{s}</li>)}
              </ol>
              {cfg.emergencias_notas[em.id] && (
                <p style={{ marginTop: 6, fontSize: 10, color: '#555', fontStyle: 'italic', borderTop: '1px solid #ccc', paddingTop: 4 }}>
                  <strong>Notas específicas CT:</strong> {cfg.emergencias_notas[em.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Números de emergencia */}
      <h2 style={{ fontSize: 13, color: '#1e3a5f', borderBottom: '1px solid #1e3a5f', paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>Números de Emergencia</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1e3a5f', color: '#fff' }}>
            <th style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'left' }}>Organismo</th>
            <th style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'left' }}>Número</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Carabineros', '133'],
            ['Ambulancia (SAMU)', '131'],
            ['Bomberos', '132'],
            ['PDI', '134'],
            ['ACHS Rescate', '1404'],
            ['SENAPRED', '1960'],
            ['CITUC (Toxicológica)', '+56 2 2635 3800'],
            ['CCHEN (Nuclear)', '+56 2 2364 6100'],
            ['Min. Salud', '600 360 777'],
          ].map(([org, num]) => (
            <tr key={org}>
              <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{org}</td>
              <td style={{ border: '1px solid #ccc', padding: '3px 8px', fontWeight: 'bold' }}>{num}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 24, fontSize: 9, color: '#888', textAlign: 'center' }}>
        Documento generado por App MIPER · {new Date().toLocaleDateString('es-CL')} · Basado en formato tipo ACHS – Gestión de Riesgos de Desastres DS 44 / Ley 16.744
      </p>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type Tab = 'configuracion' | 'acceder' | 'amenazas' | 'vista_previa'

export default function PlanRespuestaPage() {
  const empresa  = useAppStore(s => s.empresa)
  const centro   = useAppStore(s => s.centro)

  const [tab, setTab] = useState<Tab>('configuracion')
  const [cfg, setCfg] = useState<ConfigPlan>(CONFIG_PLAN_DEFAULT)
  const [expandedEm, setExpandedEm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const lsKey = `plan_respuesta_${empresa?.id ?? 'default'}`

  // ── Load from localStorage + auto-fill from store ──────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(lsKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ConfigPlan
        setCfg(prev => ({ ...prev, ...parsed }))
        return
      } catch { /* continue */ }
    }
    // Auto-fill from store if no saved data
    const totalWorkers = centro
      ? (centro.n_trabajadores_hombres || 0) + (centro.n_trabajadores_mujeres || 0) + (centro.n_trabajadores_otro || 0)
      : 0
    setCfg(prev => ({
      ...prev,
      nombre_centro: centro?.nombre || prev.nombre_centro,
      direccion:     centro?.direccion || prev.direccion,
      comuna:        empresa?.comuna || prev.comuna,
      n_propios:     totalWorkers > 0 ? String(totalWorkers) : prev.n_propios,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.id])

  // ── Save to localStorage ────────────────────────────────────────────────────
  const save = useCallback((newCfg: ConfigPlan) => {
    try { localStorage.setItem(lsKey, JSON.stringify(newCfg)) } catch { /* noop */ }
  }, [lsKey])

  const update = useCallback((patch: Partial<ConfigPlan>) => {
    setCfg(prev => {
      const next = { ...prev, ...patch }
      save(next)
      return next
    })
  }, [save])

  const updateField = useCallback(<K extends keyof ConfigPlan>(key: K, val: ConfigPlan[K]) => {
    update({ [key]: val } as Partial<ConfigPlan>)
  }, [update])

  // ── Guardar manual ──────────────────────────────────────────────────────────
  const handleGuardar = () => {
    try {
      localStorage.setItem(lsKey, JSON.stringify(cfg))
      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 2000)
    } catch { /* noop */ }
  }

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print()

  const handlePDF = async () => {
    if (!printRef.current) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      // Mostrar el target temporalmente para que html2canvas lo capture
      printRef.current.style.display = 'block'
      await new Promise(r => setTimeout(r, 150))
      const canvas = await html2canvas(printRef.current, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' })
      printRef.current.style.display = 'none'
      const imgData = canvas.toDataURL('image/jpeg', 0.85)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      const imgH  = pageW / ratio
      let yPos = 0
      while (yPos < imgH) {
        if (yPos > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -yPos, pageW, imgH)
        yPos += pageH
      }
      const nombre = empresa?.razon_social?.replace(/\s+/g, '_') || 'empresa'
      pdf.save(`PlanRespuesta_${nombre}_${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setSaving(false)
    }
  }

  // ── Word / DOCX export ──────────────────────────────────────────────────────
  const handleDocx = async () => {
    if (saving) return
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const D = await import('docx') as any
      const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = D

      // ── constants ───────────────────────────────────────────────────────────
      const PW   = 9638           // content width: A4 (11906) - 2×1134 DXA (2 cm each side)
      const DARK = '1E3A5F'
      const LGRAY = 'EFF3F7'
      const brd  = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }
      const borders = { top: brd, bottom: brd, left: brd, right: brd }
      const mar  = { top: 80, bottom: 80, left: 120, right: 120 }

      // ── micro-helpers ────────────────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const run = (text: string, o: any = {}) =>
        new TextRun({ text, font: 'Arial', size: o.size ?? 20, bold: o.bold ?? false,
          color: o.color, italics: o.italics ?? false })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const para = (runs: any[], o: any = {}) =>
        new Paragraph({ children: runs, alignment: o.align,
          spacing: { before: o.sb ?? 40, after: o.sa ?? 60 }, border: o.border })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mkCell = (children: any[], o: any = {}) =>
        new TableCell({ children, borders, margins: mar,
          width: { size: o.w ?? PW, type: WidthType.DXA },
          shading: o.bg ? { fill: o.bg, type: ShadingType.CLEAR } : undefined,
          verticalAlign: o.va ?? VerticalAlign.TOP,
          columnSpan: o.span })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mkRow = (...cells: any[]) => new TableRow({ children: cells })

      const heading = (text: string) =>
        para([run(text, { bold: true, size: 22, color: DARK })],
          { sb: 240, sa: 120, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK, space: 4 } } })

      const subheading = (text: string) =>
        para([run(text, { bold: true, size: 20 })], { sb: 160, sa: 80 })

      const bodyPara = (text: string) =>
        para([run(text, { size: 18 })], { sb: 40, sa: 60 })

      const twoColTable = (data: [string, string][], ws: [number, number] = [3500, PW - 3500]) =>
        new Table({
          width: { size: PW, type: WidthType.DXA }, columnWidths: ws,
          rows: data.map(([label, val]) => mkRow(
            mkCell([para([run(label, { bold: true, size: 18 })])], { bg: LGRAY, w: ws[0] }),
            mkCell([para([run(val || '—', { size: 18 })])],         { w: ws[1] }),
          ))
        })

      const spacer = (px = 120) => para([], { sb: px, sa: 0 })

      // ── computed values ──────────────────────────────────────────────────────
      const activas = EMERGENCIAS.filter(e => cfg.emergencias_activas[e.id] !== false)
      const total   = ['n_propios','n_contratistas','n_proveedores','n_externos','n_visitas']
        .reduce((s, k) => s + (parseInt((cfg as any)[k]) || 0), 0)
      const hw = Math.round(PW / 4)

      // ── 1. Title banner ──────────────────────────────────────────────────────
      const titleBanner = new Table({
        width: { size: PW, type: WidthType.DXA }, columnWidths: [PW],
        rows: [mkRow(mkCell([
          para([run('PLAN DE RESPUESTA ANTE EMERGENCIAS EN CENTROS DE TRABAJO',
            { bold: true, size: 24, color: 'FFFFFF' })], { align: AlignmentType.CENTER, sb: 80, sa: 40 }),
          para([run(empresa?.razon_social || '[NOMBRE ENTIDAD EMPLEADORA]',
            { size: 22, color: 'FFFFFF' })], { align: AlignmentType.CENTER, sb: 0, sa: 40 }),
          para([run('DS 44 · Ley N°16.744 · Metodología ACCEDER · SENAPRED',
            { size: 18, color: 'E0E8F0' })], { align: AlignmentType.CENTER, sb: 0, sa: 80 }),
        ], { bg: DARK, w: PW }))]
      })

      // ── 2. Identification table ──────────────────────────────────────────────
      const idTable = new Table({
        width: { size: PW, type: WidthType.DXA }, columnWidths: [hw, hw, hw, hw],
        rows: [
          mkRow(
            mkCell([para([run('Código',  { bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            mkCell([para([run(cfg.codigo || '—',   { size: 18 })])],  { w: hw }),
            mkCell([para([run('Revisión',{ bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            mkCell([para([run(cfg.revision || '—', { size: 18 })])],  { w: hw }),
          ),
          mkRow(
            mkCell([para([run('Versión', { bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            mkCell([para([run(cfg.version || '—',  { size: 18 })])],  { w: hw }),
            mkCell([para([run('Vigencia',{ bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            mkCell([para([run(cfg.vigencia || '—', { size: 18 })])],  { w: hw }),
          ),
          mkRow(
            mkCell([para([run('Elaborado por', { bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            mkCell([
              para([run(cfg.elaborado_por || '—', { size: 18 })]),
              para([run([cfg.cargo_elaborado, cfg.fecha_elaboracion].filter(Boolean).join(' — '), { size: 16, color: '888888' })]),
            ], { w: hw }),
            mkCell([para([run('Revisado por', { bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            mkCell([
              para([run(cfg.revisado_por || '—', { size: 18 })]),
              para([run([cfg.cargo_revisado, cfg.fecha_revision].filter(Boolean).join(' — '), { size: 16, color: '888888' })]),
            ], { w: hw }),
          ),
          mkRow(
            mkCell([para([run('Aprobado por', { bold: true, size: 18 })])], { bg: LGRAY, w: hw }),
            new TableCell({
              children: [
                para([run(cfg.aprobado_por || '—', { size: 18 })]),
                para([run([cfg.cargo_aprobado, cfg.fecha_aprobacion].filter(Boolean).join(' — '), { size: 16, color: '888888' })]),
              ],
              width: { size: hw * 3, type: WidthType.DXA },
              borders, margins: mar, columnSpan: 3,
            }),
          ),
        ]
      })

      // ── 3. EDE table ─────────────────────────────────────────────────────────
      const edeW = [Math.round(PW/5), Math.round(PW/5), Math.round(PW/5), Math.round(PW/5), PW - 4*Math.round(PW/5)]
      const edeTable = cfg.ede.length > 0 ? new Table({
        width: { size: PW, type: WidthType.DXA }, columnWidths: edeW,
        rows: [
          mkRow(...['Titular','Suplente','Área/Sección','Zona Seguridad','N° Personas'].map((h, i) =>
            mkCell([para([run(h, { bold: true, size: 17, color: 'FFFFFF' })])], { bg: DARK, w: edeW[i] }))),
          ...cfg.ede.map((r, idx) => mkRow(
            ...[r.titular, r.suplente, r.area, r.zona_seguridad, r.n_personas].map((v, i) =>
              mkCell([para([run(v || '—', { size: 17 })])], { bg: idx % 2 ? 'F8F9FA' : 'FFFFFF', w: edeW[i] }))
          ))
        ]
      }) : null

      // ── 4. Installations table ───────────────────────────────────────────────
      const iw = [Math.round(PW*0.28), Math.round(PW*0.22), Math.round(PW*0.22), PW-Math.round(PW*0.28)-Math.round(PW*0.22)-Math.round(PW*0.22)]
      const instTable = new Table({
        width: { size: PW, type: WidthType.DXA }, columnWidths: iw,
        rows: [
          mkRow(
            mkCell([para([run('Nombre Entidad Empleadora', { bold: true, size: 18 })])], { bg: LGRAY, w: iw[0] }),
            mkCell([para([run(empresa?.razon_social || '—', { size: 18 })])], { w: iw[1] }),
            mkCell([para([run('RUT', { bold: true, size: 18 })])], { bg: LGRAY, w: iw[2] }),
            mkCell([para([run(empresa?.rut || '—', { size: 18 })])], { w: iw[3] }),
          ),
          mkRow(
            mkCell([para([run('Nombre Centro de Trabajo', { bold: true, size: 18 })])], { bg: LGRAY, w: iw[0] }),
            mkCell([para([run(cfg.nombre_centro || '—', { size: 18 })])], { w: iw[1] }),
            mkCell([para([run('Tipo', { bold: true, size: 18 })])], { bg: LGRAY, w: iw[2] }),
            mkCell([para([run(cfg.tipo_centro || '—', { size: 18 })])], { w: iw[3] }),
          ),
          mkRow(
            mkCell([para([run('Dirección', { bold: true, size: 18 })])], { bg: LGRAY, w: iw[0] }),
            new TableCell({
              children: [para([run([cfg.direccion, cfg.numero, cfg.comuna, cfg.region].filter(Boolean).join(', '), { size: 18 })])],
              width: { size: PW - iw[0], type: WidthType.DXA }, borders, margins: mar, columnSpan: 3,
            }),
          ),
          mkRow(
            mkCell([para([run('Entorno', { bold: true, size: 18 })])], { bg: LGRAY, w: iw[0] }),
            new TableCell({
              children: [para([run(cfg.descripcion_entorno || '—', { size: 18 })])],
              width: { size: PW - iw[0], type: WidthType.DXA }, borders, margins: mar, columnSpan: 3,
            }),
          ),
        ]
      })

      // ── 5. Carga ocupacional table ───────────────────────────────────────────
      const cw = [Math.round(PW*0.42), Math.round(PW*0.13)]
      const coTable = new Table({
        width: { size: cw[0]+cw[1], type: WidthType.DXA }, columnWidths: cw,
        rows: ([
          ['Trabajadores propios', cfg.n_propios],
          ['Contratistas',         cfg.n_contratistas],
          ['Proveedores',          cfg.n_proveedores],
          ['Externos / independientes', cfg.n_externos],
          ['Visitas / clientes / usuarios', cfg.n_visitas],
          ['Total',                String(total || '—')],
        ] as [string, string][]).map(([k, v]) => mkRow(
          mkCell([para([run(k, { bold: k==='Total', size: 18 })])], { bg: LGRAY, w: cw[0] }),
          mkCell([para([run(v || '—', { bold: k==='Total', size: 18 })])], { w: cw[1] }),
        ))
      })

      // ── 6. Emergency procedure blocks ────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emergencyBlocks: any[] = []
      for (const em of activas) {
        emergencyBlocks.push(
          new Table({
            width: { size: PW, type: WidthType.DXA }, columnWidths: [PW],
            rows: [mkRow(mkCell([para([run(em.nombre, { bold: true, size: 20, color: 'FFFFFF' })])], { bg: DARK, w: PW }))]
          })
        )
        if (em.info_contexto?.length) {
          emergencyBlocks.push(new Table({
            width: { size: PW, type: WidthType.DXA }, columnWidths: [PW],
            rows: [mkRow(mkCell([
              para([run('Contexto:', { bold: true, size: 18 })]),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...em.info_contexto.map((c: any) => para([run(`• ${c}`, { size: 17 })], { sb: 0, sa: 40 }))
            ], { bg: 'FFFBEB', w: PW }))]
          }))
        }
        const pw3 = [Math.round(PW/3), Math.round(PW/3), PW - 2*Math.round(PW/3)]
        emergencyBlocks.push(new Table({
          width: { size: PW, type: WidthType.DXA }, columnWidths: pw3,
          rows: [mkRow(
            mkCell([
              para([run('Líder de Respuesta (LRC)', { bold: true, size: 17 })], { sa: 60 }),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...em.procedimiento_lrc.map((s: any, i: number) => para([run(`${i+1}. ${s}`, { size: 16 })], { sb: 0, sa: 40 }))
            ], { bg: 'E8F0FE', w: pw3[0] }),
            mkCell([
              para([run('Encargado de Evacuación (EDE)', { bold: true, size: 17 })], { sa: 60 }),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...em.procedimiento_ede.map((s: any, i: number) => para([run(`${i+1}. ${s}`, { size: 16 })], { sb: 0, sa: 40 }))
            ], { bg: 'E6F4EA', w: pw3[1] }),
            mkCell([
              para([run('Personas en General (PG)', { bold: true, size: 17 })], { sa: 60 }),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...em.procedimiento_pg.map((s: any, i: number) => para([run(`${i+1}. ${s}`, { size: 16 })], { sb: 0, sa: 40 }))
            ], { bg: 'FCE8E6', w: pw3[2] }),
          )]
        }))
        if (cfg.emergencias_notas[em.id]) {
          emergencyBlocks.push(para([
            run('Notas del CT: ', { bold: true, size: 17 }),
            run(cfg.emergencias_notas[em.id], { size: 17, italics: true }),
          ], { sb: 60, sa: 120 }))
        }
        emergencyBlocks.push(spacer())
      }

      // ── 7. Emergency numbers table ───────────────────────────────────────────
      const nw = [Math.round(PW*0.5), PW - Math.round(PW*0.5)]
      const numTable = new Table({
        width: { size: PW, type: WidthType.DXA }, columnWidths: nw,
        rows: [
          mkRow(
            mkCell([para([run('Organismo', { bold: true, size: 18, color: 'FFFFFF' })])], { bg: DARK, w: nw[0] }),
            mkCell([para([run('Número',    { bold: true, size: 18, color: 'FFFFFF' })])], { bg: DARK, w: nw[1] }),
          ),
          ...([
            ['Carabineros',        '133'],
            ['Ambulancia (SAMU)',  '131'],
            ['Bomberos',           '132'],
            ['PDI',                '134'],
            ['ACHS Rescate',       '1404'],
            ['SENAPRED',           '1960'],
            ['CITUC (Toxicológica)', '+56 2 2635 3800'],
            ['CCHEN (Nuclear)',    '+56 2 2364 6100'],
            ['Min. Salud',         '600 360 777'],
          ] as [string, string][]).map(([org, num]) => mkRow(
            mkCell([para([run(org, { size: 18 })])], { w: nw[0] }),
            mkCell([para([run(num, { bold: true, size: 18 })])], { w: nw[1] }),
          ))
        ]
      })

      // ── 8. Assemble document ─────────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children: any[] = [
        titleBanner, spacer(160),
        idTable,     spacer(160),

        heading('Introducción'),
        bodyPara(`El presente documento establece las medidas y procedimientos de actuación de ${empresa?.razon_social || '[ENTIDAD EMPLEADORA]'} para responder a las situaciones de emergencia o desastre que puedan materializarse en sus centros de trabajo. Está basado en la metodología ACCEDER del SENAPRED y en las guías para la implementación del plan para la reducción del riesgo de desastres en centros de trabajo.`),

        heading('1. Información del Plan'),
        bodyPara(`Descripción: Conjunto de medios y procedimientos de actuación de ${empresa?.razon_social || '[ENTIDAD EMPLEADORA]'} dirigidos a responder a las potenciales situaciones de emergencia en sus centros de trabajo.`),
        bodyPara(`Alcance: Este plan aplica al centro de trabajo ${cfg.nombre_centro || '[NOMBRE CENTRO]'} de ${empresa?.razon_social || '[ENTIDAD EMPLEADORA]'}, considerando trabajadores propios, contratistas, clientes y usuarios.`),

        heading('4. Funciones y Responsabilidades'),
        twoColTable([
          ['LRC Titular',  cfg.lrc_titular],
          ['LRC Suplente', cfg.lrc_suplente],
        ]),
        ...(cfg.ede.length > 0 && edeTable ? [
          para([run('Encargados de Evacuación (EDE):', { bold: true, size: 20 })], { sb: 160, sa: 80 }),
          edeTable,
        ] : []),

        heading('5. Antecedentes de las Instalaciones'),
        instTable,
        para([run('Carga Ocupacional:', { bold: true, size: 20 })], { sb: 160, sa: 80 }),
        coTable,

        heading('Planificación de la Respuesta — Metodología ACCEDER'),
        subheading('A — Alerta y Alarma'),
        twoColTable([
          ['Encargado de alertas',           cfg.encargado_alerta],
          ['Cómo se validará la alerta',     cfg.validacion_alerta],
          ['Acciones al validar la alerta',  cfg.acciones_alerta],
          ['Encargado de generar la alarma', cfg.encargado_alarma],
          ['Tipo de alarma',                 cfg.tipo_alarma],
          ['Cómo se dará la alarma',         cfg.como_alarma],
        ]),
        subheading('C — Comunicación'),
        twoColTable([
          ['Encargado comunicaciones internas', cfg.encargado_com_interna],
          ['Encargado comunicaciones externas', cfg.encargado_com_externa],
        ]),
        subheading('C — Coordinación — Zonas de Seguridad'),
        twoColTable([
          ['Zona de seguridad interna', cfg.zona_seguridad_interna],
          ['Zona de seguridad externa', cfg.zona_seguridad_externa],
        ]),

        heading('Procedimientos de Actuación por Amenaza'),
        para([run(`Amenazas activas: ${activas.map(e => e.nombre).join(', ')}`, { size: 18, color: '666666', italics: true })], { sb: 80, sa: 160 }),
        ...emergencyBlocks,

        heading('Números de Emergencia'),
        numTable,
        spacer(240),
        para([run(
          `Documento generado por App MIPER · ${new Date().toLocaleDateString('es-CL')} · Basado en formato tipo ACHS – DS 44 / Ley 16.744`,
          { size: 16, color: '888888', italics: true }
        )], { align: AlignmentType.CENTER, sb: 0, sa: 0,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 8 } } }),
      ]

      const doc = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
        sections: [{
          properties: {
            page: {
              size:   { width: 11906, height: 16838 },
              margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
            },
          },
          children,
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      const nombre = empresa?.razon_social?.replace(/\s+/g, '_') || 'empresa'
      a.download = `PlanRespuesta_${nombre}_${new Date().toISOString().slice(0, 10)}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setSaving(false)
    }
  }

  // ── EDE helpers ─────────────────────────────────────────────────────────────
  const addEde = () => updateField('ede', [...cfg.ede, { titular: '', suplente: '', area: '', zona_seguridad: '', n_personas: '' }])
  const removeEde = (i: number) => updateField('ede', cfg.ede.filter((_, idx) => idx !== i))
  const updateEde = (i: number, key: keyof EdeItem, val: string) => {
    const ede = cfg.ede.map((r, idx) => idx === i ? { ...r, [key]: val } : r)
    updateField('ede', ede)
  }

  // ── Turnos helpers ───────────────────────────────────────────────────────────
  const addTurno = () => updateField('turnos', [...cfg.turnos, { nombre: '', n_trabajadores: '', hora_inicio: '', hora_termino: '', observaciones: '' }])
  const removeTurno = (i: number) => updateField('turnos', cfg.turnos.filter((_, idx) => idx !== i))
  const updateTurno = (i: number, key: keyof Turno, val: string) => {
    const turnos = cfg.turnos.map((r, idx) => idx === i ? { ...r, [key]: val } : r)
    updateField('turnos', turnos)
  }

  // ── Emergencias helpers ─────────────────────────────────────────────────────
  const toggleEmergencia = (id: string) => {
    const activas = { ...cfg.emergencias_activas, [id]: !cfg.emergencias_activas[id] }
    updateField('emergencias_activas', activas)
  }
  const updateNota = (id: string, nota: string) => {
    const notas = { ...cfg.emergencias_notas, [id]: nota }
    updateField('emergencias_notas', notas)
  }

  const activasCount = EMERGENCIAS.filter(e => cfg.emergencias_activas[e.id] !== false).length

  const TABS: { id: Tab; label: string }[] = [
    { id: 'configuracion', label: '⚙️ Configuración' },
    { id: 'acceder', label: '📋 Plan ACCEDER' },
    { id: 'amenazas', label: `⚠️ Amenazas (${activasCount})` },
    { id: 'vista_previa', label: '🖨️ Vista Previa' },
  ]

  return (
    <>
      {/* Print styles */}
      <style>{`
        @page { margin: 0; size: A4 portrait; }
        @media print {
          body > * { display: none !important; }
          #plan-print { display: block !important; }
        }
        @media screen { #plan-print { display: none; } }
      `}</style>

      <div className="flex flex-col h-full min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1e3a5f]">🚨 Plan de Respuesta ante Emergencias</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {empresa?.razon_social || 'Sin empresa'} · Metodología ACCEDER · SENAPRED / DS 44 / Ley 16.744
              </p>
            </div>
            <button
              onClick={handleGuardar}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                guardadoOk
                  ? 'bg-green-50 text-green-700 border border-green-300'
                  : 'bg-[#1e3a5f] text-white hover:bg-[#15294a]'
              }`}
            >
              {guardadoOk ? '✅ Guardado' : '💾 Guardar'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-slate-200 -mb-4">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-[#1e3a5f] text-[#1e3a5f] bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">

          {/* ── Tab: Configuración ─────────────────────────────────────────────── */}
          {tab === 'configuracion' && (
            <div className="max-w-4xl space-y-6">

              {/* Portada */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>Identificación del Documento</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Código" value={cfg.codigo} onChange={v => updateField('codigo', v)} />
                  <Field label="Revisión" value={cfg.revision} onChange={v => updateField('revision', v)} />
                  <Field label="Versión" value={cfg.version} onChange={v => updateField('version', v)} />
                  <Field label="Vigencia (fecha)" value={cfg.vigencia} onChange={v => updateField('vigencia', v)} type="date" />
                </div>

                <SectionTitle>Elaboración, Revisión y Aprobación</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { prefix: 'elaborado', label: 'Elaborado por' },
                    { prefix: 'revisado', label: 'Revisado por' },
                    { prefix: 'aprobado', label: 'Aprobado por' },
                  ].map(({ prefix, label }) => (
                    <div key={prefix} className="border rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
                      <Field label="Nombre" value={(cfg as any)[`${prefix}_por`]} onChange={v => updateField(`${prefix}_por` as keyof ConfigPlan, v as any)} />
                      <Field label="Cargo" value={(cfg as any)[`cargo_${prefix}`]} onChange={v => updateField(`cargo_${prefix}` as keyof ConfigPlan, v as any)} />
                      <Field label="Fecha" value={(cfg as any)[`fecha_${prefix === 'elaborado' ? 'elaboracion' : prefix === 'revisado' ? 'revision' : 'aprobacion'}`]} onChange={v => updateField(`fecha_${prefix === 'elaborado' ? 'elaboracion' : prefix === 'revisado' ? 'revision' : 'aprobacion'}` as keyof ConfigPlan, v as any)} type="date" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instalaciones */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>Individualización del Centro de Trabajo</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Nombre del Centro de Trabajo" value={cfg.nombre_centro} onChange={v => updateField('nombre_centro', v)} placeholder="Ej: Casa Matriz Santiago" />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">Tipo de Centro</label>
                    <select
                      value={cfg.tipo_centro}
                      onChange={e => updateField('tipo_centro', e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="casa_matriz">Casa Matriz</option>
                      <option value="sucursal">Sucursal</option>
                      <option value="faena">Faena</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <Field label="Dirección (calle/avenida)" value={cfg.direccion} onChange={v => updateField('direccion', v)} />
                  <Field label="Número" value={cfg.numero} onChange={v => updateField('numero', v)} />
                  <Field label="Comuna" value={cfg.comuna} onChange={v => updateField('comuna', v)} />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">Región</label>
                    <select
                      value={cfg.region}
                      onChange={e => updateField('region', e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Seleccionar...</option>
                      {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <Textarea label="Descripción del entorno del centro de trabajo" value={cfg.descripcion_entorno} onChange={v => updateField('descripcion_entorno', v)} placeholder="Ej: Zona urbana, rodeado de edificios residenciales, cercano a Av. principal..." rows={2} />
                </div>
              </div>

              {/* Carga ocupacional */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>Carga Ocupacional</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    ['n_propios', 'Trabajadores propios'],
                    ['n_contratistas', 'Contratistas'],
                    ['n_proveedores', 'Proveedores'],
                    ['n_externos', 'Externos / independientes'],
                    ['n_visitas', 'Visitas / clientes / usuarios'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label} value={(cfg as any)[key]} onChange={v => updateField(key as keyof ConfigPlan, v as any)} type="number" />
                  ))}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">Total calculado</label>
                    <div className="border border-slate-200 bg-slate-50 rounded px-2 py-1.5 text-sm font-bold text-slate-700">
                      {(parseInt(cfg.n_propios) || 0) + (parseInt(cfg.n_contratistas) || 0) + (parseInt(cfg.n_proveedores) || 0) + (parseInt(cfg.n_externos) || 0) + (parseInt(cfg.n_visitas) || 0)}
                    </div>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-500 uppercase mt-4 mb-2">Grupos de Riesgo</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['n_no_espanol', 'No hablan español'],
                    ['n_menores', 'Menores de edad'],
                    ['n_discapacidad', 'Discapacidad'],
                    ['n_gestantes', 'Gestantes'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label} value={(cfg as any)[key]} onChange={v => updateField(key as keyof ConfigPlan, v as any)} type="number" />
                  ))}
                </div>

                <SectionTitle>Distribución de Jornadas</SectionTitle>
                <div className="space-y-3">
                  {cfg.turnos.map((t, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-end bg-slate-50 rounded-lg p-3">
                      <Field label="Nombre turno" value={t.nombre} onChange={v => updateTurno(i, 'nombre', v)} placeholder="Ej: Diurno" />
                      <Field label="N° trabajadores" value={t.n_trabajadores} onChange={v => updateTurno(i, 'n_trabajadores', v)} type="number" />
                      <Field label="Hora inicio" value={t.hora_inicio} onChange={v => updateTurno(i, 'hora_inicio', v)} type="time" />
                      <Field label="Hora término" value={t.hora_termino} onChange={v => updateTurno(i, 'hora_termino', v)} type="time" />
                      <button onClick={() => removeTurno(i)} className="text-red-400 hover:text-red-600 text-sm pb-1">✕ Eliminar</button>
                    </div>
                  ))}
                  <button onClick={addTurno} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Agregar turno</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Plan ACCEDER ──────────────────────────────────────────────── */}
          {tab === 'acceder' && (
            <div className="max-w-4xl space-y-6">

              {/* Metodología ACCEDER info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-bold mb-1">Metodología ACCEDER (SENAPRED)</p>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  {['A – Alerta y alarma', 'C – Comunicación', 'C – Coordinación', 'E – Evaluación preliminar', 'D – Decisiones', 'E – Evaluación complementaria', 'R – Readecuación'].map(s => (
                    <span key={s} className="bg-blue-100 rounded px-2 py-1 text-xs text-center">{s}</span>
                  ))}
                </div>
              </div>

              {/* Alerta y Alarma */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>A — Alerta y Alarma</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre encargado de alertas internas y externas" value={cfg.encargado_alerta} onChange={v => updateField('encargado_alerta', v)} placeholder="Nombre y cargo" />
                  <Textarea label="Cómo se validará la alerta" value={cfg.validacion_alerta} onChange={v => updateField('validacion_alerta', v)} placeholder="Ej: Consultar plataforma SENAPRED, verificar fuente interna..." rows={2} />
                  <Textarea label="Acciones al validar la alerta" value={cfg.acciones_alerta} onChange={v => updateField('acciones_alerta', v)} placeholder="Ej: Informar al LRC, preparar equipos de evacuación..." rows={2} />
                  <Field label="Nombre encargado de generar la alarma" value={cfg.encargado_alarma} onChange={v => updateField('encargado_alarma', v)} placeholder="Nombre y cargo" />
                  <Field label="Cuál será la alarma (tipo de señal)" value={cfg.tipo_alarma} onChange={v => updateField('tipo_alarma', v)} placeholder="Ej: Sirena, megáfono, mensaje de texto, timbre..." />
                  <Textarea label="Cómo se dará la alarma" value={cfg.como_alarma} onChange={v => updateField('como_alarma', v)} placeholder="Ej: A viva voz usando megáfono, 3 pitidos cortos = evacuación..." rows={2} />
                </div>
              </div>

              {/* Comunicación */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>C — Comunicación</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Encargado de comunicaciones internas" value={cfg.encargado_com_interna} onChange={v => updateField('encargado_com_interna', v)} placeholder="Nombre y cargo" />
                  <Field label="Encargado de comunicaciones externas" value={cfg.encargado_com_externa} onChange={v => updateField('encargado_com_externa', v)} placeholder="Nombre y cargo" />
                </div>
                <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded p-3">
                  <strong>Receptores externos estándar a considerar:</strong> Familiares de trabajadores, proveedores, Organismo de Salud, Carabineros, Bomberos, comunidad circundante.
                </div>
              </div>

              {/* Coordinación LRC */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>C — Coordinación — Líder de Respuesta (LRC)</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="LRC Titular" value={cfg.lrc_titular} onChange={v => updateField('lrc_titular', v)} placeholder="Nombre completo" />
                  <Field label="LRC Suplente" value={cfg.lrc_suplente} onChange={v => updateField('lrc_suplente', v)} placeholder="Nombre completo" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <Textarea label="Zona de seguridad interna" value={cfg.zona_seguridad_interna} onChange={v => updateField('zona_seguridad_interna', v)} placeholder="Ej: Gimnasio, salón comedor, piso 3..." rows={2} />
                  <Textarea label="Zona de seguridad externa" value={cfg.zona_seguridad_externa} onChange={v => updateField('zona_seguridad_externa', v)} placeholder="Ej: Estacionamiento Av. Principal, Plaza XX..." rows={2} />
                </div>
              </div>

              {/* EDE */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionTitle>C — Coordinación — Encargados de Evacuación (EDE)</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-xs text-slate-600">
                        {['Titular', 'Suplente', 'Área / Sección', 'Zona de Seguridad', 'N° Personas', ''].map(h => (
                          <th key={h} className="px-2 py-2 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cfg.ede.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {(['titular', 'suplente', 'area', 'zona_seguridad', 'n_personas'] as const).map(k => (
                            <td key={k} className="px-1 py-1">
                              <input
                                type="text"
                                value={row[k]}
                                onChange={e => updateEde(i, k, e.target.value)}
                                className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </td>
                          ))}
                          <td className="px-1 py-1">
                            <button onClick={() => removeEde(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={addEde} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">+ Agregar EDE</button>
              </div>
            </div>
          )}

          {/* ── Tab: Amenazas ──────────────────────────────────────────────────── */}
          {tab === 'amenazas' && (
            <div className="max-w-4xl">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                <strong>Instrucción:</strong> Activa o desactiva las amenazas que aplican a tu centro de trabajo. Las amenazas activas se incluirán en la Vista Previa e impresión del plan. Puedes agregar notas específicas para cada amenaza.
              </div>

              {/* Grid de amenazas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EMERGENCIAS.map(em => {
                  const activa = cfg.emergencias_activas[em.id] !== false
                  const expanded = expandedEm === em.id
                  return (
                    <div key={em.id} className={`rounded-xl border-2 transition-all ${activa ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                      <div className="flex items-center gap-3 p-3">
                        <span className="text-xl">{em.icono}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${activa ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{em.nombre}</p>
                        </div>
                        <button
                          onClick={() => setExpandedEm(expanded ? null : em.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mr-2"
                        >
                          {expanded ? '▲ Ocultar' : '▼ Ver procedimiento'}
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={activa} onChange={() => toggleEmergencia(em.id)} className="sr-only peer" />
                          <div className="w-10 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                      </div>

                      {expanded && (
                        <div className="border-t border-slate-200 p-3 space-y-3">
                          {em.info_contexto && (
                            <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-700">
                              <p className="font-semibold mb-1">Contexto</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {em.info_contexto.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            </div>
                          )}

                          {[
                            { rol: '👔 Líder de Respuesta (LRC)', steps: em.procedimiento_lrc, color: 'bg-blue-50' },
                            { rol: '🦺 Encargado de Evacuación (EDE)', steps: em.procedimiento_ede, color: 'bg-green-50' },
                            { rol: '👥 Personas en General (PG)', steps: em.procedimiento_pg, color: 'bg-red-50' },
                          ].map(({ rol, steps, color }) => (
                            <div key={rol} className={`rounded-lg p-2 ${color}`}>
                              <p className="text-xs font-bold text-slate-700 mb-1">{rol}</p>
                              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-0.5">
                                {steps.map((s, i) => <li key={i}>{s}</li>)}
                              </ol>
                            </div>
                          ))}

                          <div>
                            <label className="text-xs font-medium text-slate-600">Notas específicas para este CT</label>
                            <textarea
                              rows={2}
                              value={cfg.emergencias_notas[em.id] || ''}
                              onChange={e => updateNota(em.id, e.target.value)}
                              placeholder="Agregar instrucciones o notas particulares para este centro de trabajo..."
                              className="mt-1 w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Tab: Vista Previa ──────────────────────────────────────────────── */}
          {tab === 'vista_previa' && (
            <div className="max-w-4xl">
              <div className="flex gap-3 mb-4 flex-wrap">
                <button
                  onClick={handleDocx}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
                >
                  {saving ? '⏳ Generando...' : '📄 Descargar Word'}
                </button>
                <button
                  onClick={handlePDF}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15294a] disabled:opacity-50 transition-colors"
                >
                  {saving ? '⏳ Generando...' : '🖼️ Descargar PDF'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  🖨️ Imprimir
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <PrintView cfg={cfg} empresa={empresa} centro={centro} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Print target (hidden on screen, shown during print/PDF) */}
      <div id="plan-print" ref={printRef}>
        <PrintView cfg={cfg} empresa={empresa} centro={centro} />
      </div>
    </>
  )
}
