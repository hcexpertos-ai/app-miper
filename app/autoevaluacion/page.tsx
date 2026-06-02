'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/src/store/app-store'
import {
  ITEMS, SECCIONES,
  type Respuesta, type ItemAutoevaluacion, type SeccionMeta,
} from '@/src/lib/autoevaluacion-data'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Respuestas = Record<number, Respuesta>

interface PlanItem {
  responsable:      string
  fecha_inicio:     string
  fecha_compromiso: string
  estado:           'pendiente' | 'en_progreso' | 'completado'
  observacion:      string
}
type Plan = Record<number, PlanItem>

const PLAN_DEFAULT: PlanItem = {
  responsable: '', fecha_inicio: '', fecha_compromiso: '', estado: 'pendiente', observacion: '',
}
const PLAN_ESTADO_STYLE: Record<PlanItem['estado'], string> = {
  pendiente:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  en_progreso: 'bg-blue-100   text-blue-800   border-blue-300',
  completado:  'bg-green-100  text-green-800  border-green-300',
}
const PLAN_ESTADO_LABEL: Record<PlanItem['estado'], string> = {
  pendiente:   'Pendiente',
  en_progreso: 'En Progreso',
  completado:  'Completado',
}

interface SeccionStats {
  romana:    string
  nombre:    string
  total:     number
  si:        number
  no:        number
  na:        number
  pct:       number   // si / (si+no) * 100
}

// ─── Cálculos ─────────────────────────────────────────────────────────────────

function calcStats(respuestas: Respuestas): {
  total: number; respondidos: number
  si: number; no: number; na: number
  aplicables: number; pct: number
  porSeccion: SeccionStats[]
} {
  const total = ITEMS.length

  let si = 0, no = 0, na = 0
  for (const v of Object.values(respuestas)) {
    if (v === 'si') si++
    else if (v === 'no') no++
    else if (v === 'na') na++
  }
  const respondidos = si + no + na
  const aplicables  = si + no
  const pct         = aplicables > 0 ? Math.round((si / aplicables) * 100) : 0

  const porSeccion: SeccionStats[] = SECCIONES.map(sec => {
    const items = ITEMS.filter(i => i.seccion_romana === sec.romana)
    let s = 0, n = 0, a = 0
    for (const item of items) {
      const r = respuestas[item.id]
      if (r === 'si') s++
      else if (r === 'no') n++
      else if (r === 'na') a++
    }
    const ap = s + n
    return {
      romana: sec.romana, nombre: sec.nombre,
      total: items.length, si: s, no: n, na: a,
      pct: ap > 0 ? Math.round((s / ap) * 100) : -1,
    }
  })

  return { total, respondidos, si, no, na, aplicables, pct, porSeccion }
}

// ─── Donut Chart SVG ──────────────────────────────────────────────────────────

function DonutChart({ si, no, na, total, pct }: {
  si: number; no: number; na: number; total: number; pct: number
}) {
  const SIZE = 200, cx = 100, cy = 100, R = 78, rIn = 52
  const sinResp = total - si - no - na
  const segs = [
    { v: si,      color: '#22c55e' },
    { v: no,      color: '#ef4444' },
    { v: na,      color: '#94a3b8' },
    { v: sinResp, color: '#e2e8f0' },
  ]
  const sum = segs.reduce((a, s) => a + s.v, 0)
  if (sum === 0) return (
    <svg width={SIZE} height={SIZE}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth={26} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fill="#94a3b8">Sin datos</text>
    </svg>
  )

  let angle = -Math.PI / 2
  const paths: React.ReactNode[] = []

  for (const seg of segs) {
    if (seg.v === 0) continue
    const start  = angle
    const delta  = (seg.v / sum) * 2 * Math.PI
    angle += delta
    const end    = angle
    const large  = delta > Math.PI ? 1 : 0

    const x1 = cx + R * Math.cos(start),  y1 = cy + R * Math.sin(start)
    const x2 = cx + R * Math.cos(end),    y2 = cy + R * Math.sin(end)
    const xi1= cx + rIn*Math.cos(end),    yi1= cy + rIn*Math.sin(end)
    const xi2= cx + rIn*Math.cos(start),  yi2= cy + rIn*Math.sin(start)

    paths.push(
      <path key={seg.color}
        d={`M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${xi1} ${yi1} A${rIn} ${rIn} 0 ${large} 0 ${xi2} ${yi2}Z`}
        fill={seg.color}
      />
    )
  }

  const pctColor = pct < 0 ? '#94a3b8' : pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {paths}
      <circle cx={cx} cy={cy} r={rIn - 2} fill="white" />
      {pct >= 0 ? (
        <>
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="bold" fill={pctColor}>{pct}%</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#64748b">Cumplimiento</text>
          <text x={cx} y={cy + 25} textAnchor="middle" fontSize="9" fill="#94a3b8">({si} de {si+no} aplic.)</text>
        </>
      ) : (
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fill="#94a3b8">Sin respuestas</text>
      )}
    </svg>
  )
}

// ─── Barras por sección ───────────────────────────────────────────────────────

function SeccionBars({ stats }: { stats: SeccionStats[] }) {
  return (
    <div className="space-y-2.5">
      {stats.map(s => {
        const pct   = s.pct < 0 ? 0 : s.pct
        const color = s.pct < 0  ? 'bg-slate-200' : s.pct >= 80 ? 'bg-green-500' : s.pct >= 60 ? 'bg-yellow-400' : 'bg-red-500'
        const txt   = s.pct < 0  ? '—' : `${s.pct}%`
        return (
          <div key={s.romana}>
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                <span className="text-[#1e3a5f] font-bold mr-1">{s.romana}.</span>{s.nombre}
              </span>
              <span className="font-bold text-[11px] ml-2 whitespace-nowrap" style={{ color: s.pct < 0 ? '#94a3b8' : s.pct >= 80 ? '#16a34a' : s.pct >= 60 ? '#d97706' : '#dc2626' }}>
                {txt}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5">
              <span>✅ {s.si}</span>
              <span>❌ {s.no}</span>
              <span>⊘ {s.na}</span>
              <span className="ml-auto">{s.si + s.no + s.na}/{s.total}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tabla de resultados ──────────────────────────────────────────────────────

function TablaResultados({ stats, pct }: { stats: SeccionStats[]; pct: number }) {
  const totSi  = stats.reduce((a, s) => a + s.si,  0)
  const totNo  = stats.reduce((a, s) => a + s.no,  0)
  const totNa  = stats.reduce((a, s) => a + s.na,  0)
  const totTot = stats.reduce((a, s) => a + s.total, 0)

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-[#1e3a5f] text-white">
          {['N°','Sección','Total','Sí','No','N/A','% Cumpl.'].map(h => (
            <th key={h} className="px-2 py-1.5 text-left font-semibold text-[10px] border border-[#2a4f7a]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {stats.map((s, i) => {
          const bg   = i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
          const pctS = s.pct < 0 ? '—' : `${s.pct}%`
          const pctC = s.pct < 0 ? 'text-slate-400' : s.pct >= 80 ? 'text-green-700 font-bold' : s.pct >= 60 ? 'text-yellow-700 font-bold' : 'text-red-700 font-bold'
          return (
            <tr key={s.romana} className={bg}>
              <td className="px-2 py-1.5 border border-slate-200 font-bold text-[#1e3a5f]">{s.romana}</td>
              <td className="px-2 py-1.5 border border-slate-200 max-w-[180px]">{s.nombre}</td>
              <td className="px-2 py-1.5 border border-slate-200 text-center">{s.total}</td>
              <td className="px-2 py-1.5 border border-slate-200 text-center text-green-700 font-semibold">{s.si}</td>
              <td className="px-2 py-1.5 border border-slate-200 text-center text-red-700 font-semibold">{s.no}</td>
              <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-500">{s.na}</td>
              <td className={`px-2 py-1.5 border border-slate-200 text-center ${pctC}`}>{pctS}</td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr className="bg-[#1e3a5f]/10 font-bold">
          <td colSpan={2} className="px-2 py-1.5 border border-slate-300 text-[#1e3a5f] font-bold">TOTAL</td>
          <td className="px-2 py-1.5 border border-slate-300 text-center">{totTot}</td>
          <td className="px-2 py-1.5 border border-slate-300 text-center text-green-700">{totSi}</td>
          <td className="px-2 py-1.5 border border-slate-300 text-center text-red-700">{totNo}</td>
          <td className="px-2 py-1.5 border border-slate-300 text-center text-slate-500">{totNa}</td>
          <td className={`px-2 py-1.5 border border-slate-300 text-center font-bold ${pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>{totSi+totNo > 0 ? `${pct}%` : '—'}</td>
        </tr>
      </tfoot>
    </table>
  )
}

// ─── Vista imprimible ─────────────────────────────────────────────────────────

function PrintView({ respuestas, plan, empresa, centro, fecha }: {
  respuestas: Respuestas
  plan:       Plan
  empresa:    string
  centro:     string
  fecha:      string
}) {
  const stats = calcStats(respuestas)
  const itemsPorSeccion = SECCIONES.map(sec => ({
    ...sec,
    items: ITEMS.filter(i => i.seccion_romana === sec.romana),
  }))

  const RESP_LABEL: Record<Respuesta, string> = {
    si: 'Sí', no: 'No', na: 'N/A', '': '—',
  }

  return (
    <div className="font-sans text-[11px] text-slate-800 bg-white" style={{ padding: '0.6cm 0.8cm', width: 820 }}>
      {/* ── Encabezado: franja azul con logo (logo blanco visible sobre fondo oscuro) ── */}
      <div style={{ background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', marginBottom: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="PRSO Logo" style={{ height: 52, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Autoevaluación de Cumplimiento de Aspectos Legales
          </div>
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.85 }}>Anexo N°2 · Autoevaluación Inicial</div>
          <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>DS 44 · Ley N°16.744 · Seguridad y Salud en el Trabajo</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, opacity: 0.8, whiteSpace: 'nowrap' }}>
          <div>{empresa || '—'}</div>
          <div>{centro || '—'}</div>
          <div>Fecha: {fecha}</div>
        </div>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Ítems',      val: stats.total,       color: '#1e3a5f' },
          { label: 'Cumple (Sí)',      val: stats.si,          color: '#16a34a' },
          { label: 'No Cumple (No)',   val: stats.no,          color: '#dc2626' },
          { label: '% Cumplimiento',   val: stats.pct >= 0 ? `${stats.pct}%` : '—', color: stats.pct >= 80 ? '#16a34a' : stats.pct >= 60 ? '#d97706' : '#dc2626' },
        ].map(c => (
          <div key={c.label} className="border border-slate-200 rounded p-2 text-center">
            <div className="text-lg font-bold" style={{ color: c.color }}>{c.val}</div>
            <div className="text-[9px] text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla resumen por sección */}
      <div className="mb-5">
        <div className="font-bold text-[#1e3a5f] text-[10px] uppercase tracking-wide mb-1">Resumen por Sección</div>
        <TablaResultados stats={stats.porSeccion} pct={stats.pct} />
      </div>

      {/* Checklist completo */}
      {itemsPorSeccion.map(sec => (
        <div key={sec.romana} className="mb-4">
          <div className="bg-[#1e3a5f] text-white px-3 py-1.5 font-bold text-[10px] uppercase tracking-wide rounded-t">
            {sec.romana}. {sec.nombre}
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-6">N°</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px]">Descripción</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-32">Artículo</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-8">Sí</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-8">No</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-8">N/A</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item, idx) => {
                const r = respuestas[item.id] ?? ''
                const bg = idx % 2 === 0 ? '' : 'bg-slate-50/50'
                return (
                  <tr key={item.id} className={bg}>
                    <td className="px-2 py-1.5 border border-slate-200 font-bold text-center text-[#1e3a5f]">{item.id}</td>
                    <td className="px-2 py-1.5 border border-slate-200 leading-snug">{item.descripcion}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] text-slate-500 leading-tight">{item.cuerpo_legal}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-center">{r === 'si'  ? '✓' : ''}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-center">{r === 'no'  ? '✓' : ''}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-center">{r === 'na'  ? '✓' : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Nota al pie */}
      <div className="mt-4 p-2 border border-slate-200 rounded text-[9px] text-slate-500">
        <strong>Nota:</strong> El listado de autoevaluación de cumplimiento de aspectos legales contempla sólo algunos aspectos de la normativa de seguridad y salud en el trabajo, siendo parte del proceso inicial de detección de las brechas existentes. El organismo administrador deberá proporcionar asistencia técnica según resultados de la aplicación.
      </div>

      {/* Plan de Trabajo */}
      {ITEMS.filter(i => respuestas[i.id] === 'no').length > 0 && (
        <div className="mt-6">
          <div className="bg-[#1e3a5f] text-white px-3 py-1.5 font-bold text-[10px] uppercase tracking-wide rounded-t">
            Plan de Trabajo — Cierre de Brechas
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-6">N°</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px]">Brecha / Requisito No Cumplido</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-24">Artículo</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-24">Responsable</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-18">F. Programada</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-18">F. Efectiva</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-16">Estado</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px]">Observación</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.filter(i => respuestas[i.id] === 'no').map((item, idx) => {
                const p  = plan[item.id] ?? PLAN_DEFAULT
                const bg = idx % 2 === 0 ? '' : 'bg-slate-50/50'
                return (
                  <tr key={item.id} className={bg}>
                    <td className="px-2 py-1.5 border border-slate-200 font-bold text-center text-[#1e3a5f] align-top">{item.id}</td>
                    <td className="px-2 py-1.5 border border-slate-200 leading-snug align-top text-[9px]">{item.descripcion}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] text-slate-500 align-top">{item.cuerpo_legal}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] align-top">{p.responsable || '—'}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] align-top">
                      {p.fecha_inicio ? new Date(p.fecha_inicio + 'T00:00:00').toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] align-top">
                      {p.fecha_compromiso ? new Date(p.fecha_compromiso + 'T00:00:00').toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] text-center align-top">{PLAN_ESTADO_LABEL[p.estado]}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] align-top">{p.observacion || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Firmas */}
      <div className="mt-10 grid grid-cols-2 gap-12">
        {[
          { titulo: 'Evaluador', subtitulo: 'Nombre y firma' },
          { titulo: 'Representante Legal', subtitulo: 'Nombre y firma' },
        ].map(f => (
          <div key={f.titulo}>
            <div style={{ height: 52 }} />
            <div className="border-t-2 border-slate-500 pt-2">
              <p className="text-[10px] font-bold text-slate-700 text-center">{f.titulo}</p>
              <p className="text-[9px] text-slate-400 text-center mt-0.5">{f.subtitulo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AutoevaluacionPage() {
  const { empresa, centro } = useAppStore()

  const [respuestas,    setRespuestas]    = useState<Respuestas>({})
  const [plan,          setPlan]          = useState<Plan>({})
  const [tab,           setTab]           = useState<'checklist' | 'resultados' | 'plan'>('checklist')
  const [seccionOpen,   setSeccionOpen]   = useState<string>('I')
  const [guardando,     setGuardando]     = useState(false)
  const [guardadoOk,    setGuardadoOk]    = useState(false)
  const [fechaEval,     setFechaEval]     = useState(() => new Date().toISOString().split('T')[0])

  const printRef = useRef<HTMLDivElement>(null)

  // ── Clave localStorage ──────────────────────────────────────────────────
  const lsKey = `autoevaluacion_${empresa?.id ?? 'default'}`

  // ── Cargar desde localStorage ───────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        setRespuestas(parsed.respuestas ?? parsed)
        if (parsed.fecha) setFechaEval(parsed.fecha)
        if (parsed.plan)  setPlan(parsed.plan)
      }
    } catch { /* noop */ }
  }, [lsKey])

  // ── Guardar respuesta ───────────────────────────────────────────────────
  const handleRespuesta = useCallback((id: number, valor: Respuesta) => {
    setRespuestas(prev => {
      const nuevas = { ...prev, [id]: valor }
      try { localStorage.setItem(lsKey, JSON.stringify({ respuestas: nuevas, fecha: fechaEval, plan })) }
      catch { /* noop */ }
      return nuevas
    })
  }, [lsKey, fechaEval, plan])

  // ── Actualizar campo del plan ───────────────────────────────────────────
  const handlePlanUpdate = useCallback((id: number, field: keyof PlanItem, valor: string) => {
    setPlan(prev => {
      const nuevoPlan = {
        ...prev,
        [id]: { ...(prev[id] ?? PLAN_DEFAULT), [field]: valor },
      }
      try { localStorage.setItem(lsKey, JSON.stringify({ respuestas, fecha: fechaEval, plan: nuevoPlan })) }
      catch { /* noop */ }
      return nuevoPlan
    })
  }, [lsKey, respuestas, fechaEval])

  // ── Guardar manualmente ─────────────────────────────────────────────────
  const handleGuardar = () => {
    setGuardando(true)
    try {
      localStorage.setItem(lsKey, JSON.stringify({ respuestas, fecha: fechaEval, plan }))
      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 2000)
    } finally {
      setGuardando(false)
    }
  }

  // ── Limpiar todo ────────────────────────────────────────────────────────
  const handleLimpiar = () => {
    if (!confirm('¿Deseas limpiar todas las respuestas de la Autoevaluación? Esta acción no se puede deshacer.')) return
    setRespuestas({})
    try { localStorage.removeItem(lsKey) } catch { /* noop */ }
  }

  // ── Imprimir ────────────────────────────────────────────────────────────
  const handlePrint = () => window.print()

  // ── Exportar PDF ────────────────────────────────────────────────────────
  const handlePDF = async () => {
    if (!printRef.current) return
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('jspdf') as any,
    ])

    // Mostrar el área de impresión temporalmente con ancho fijo
    printRef.current.style.display = 'block'
    printRef.current.style.width   = '820px'
    await new Promise(r => setTimeout(r, 150))

    const canvas = await html2canvas(printRef.current, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 820,
    })
    printRef.current.style.display = 'none'
    printRef.current.style.width   = ''

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pdfW) / canvas.width

    let y = 0
    while (y < imgH) {
      if (y > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, -y, pdfW, imgH)
      y += pdfH
    }

    const nombre = empresa?.razon_social?.replace(/\s+/g, '_') ?? 'empresa'
    pdf.save(`Autoevaluacion_AnexoN2_${nombre}_${fechaEval}.pdf`)
  }

  // ── Estadísticas ────────────────────────────────────────────────────────
  const stats = calcStats(respuestas)
  const { total, respondidos, si, no, na, pct, porSeccion } = stats

  // ── Ítems de cada sección ───────────────────────────────────────────────
  const seccionItems = (romana: string) => ITEMS.filter(i => i.seccion_romana === romana)

  const RESP_COLOR: Record<Respuesta, string> = {
    si: 'bg-green-100 text-green-800 border-green-300',
    no: 'bg-red-100 text-red-800 border-red-300',
    na: 'bg-slate-100 text-slate-600 border-slate-300',
    '': 'bg-white text-slate-500 border-slate-200',
  }

  const pctColor = pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-yellow-600' : pct > 0 ? 'text-red-700' : 'text-slate-400'
  const pctBg    = pct >= 80 ? 'bg-green-50 border-green-200' : pct >= 60 ? 'bg-yellow-50 border-yellow-200' : pct > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'

  return (
    <>
      {/* ── Área solo para impresión ─────────────────────────────────────── */}
      <div ref={printRef} style={{ display: 'none' }} className="print-content">
        <PrintView
          respuestas={respuestas}
          plan={plan}
          empresa={empresa?.razon_social ?? ''}
          centro={centro?.nombre ?? ''}
          fecha={fechaEval}
        />
      </div>

      {/* ── Pantalla normal ──────────────────────────────────────────────── */}
      <div className="p-4 md:p-6 max-w-6xl mx-auto">

        {/* Encabezado */}
        <div className="mb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#1e3a5f]">Autoevaluación de Cumplimiento de Aspectos Legales</h1>
              <p className="text-sm text-slate-500 mt-0.5">Anexo N°2 · Autoevaluación Inicial de Cumplimiento de Aspectos Legales · DS 44</p>
              {empresa && <p className="text-xs text-slate-400 mt-0.5">{empresa.razon_social}{centro ? ` · ${centro.nombre}` : ''}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 whitespace-nowrap">Fecha evaluación:</label>
                <input
                  type="date"
                  value={fechaEval}
                  onChange={e => setFechaEval(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1"
                />
              </div>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1e3a5f] text-white hover:bg-[#16304f] transition-colors"
              >
                {guardadoOk ? '✓ Guardado' : '💾 Guardar'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={handlePDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                📥 PDF
              </button>
              <button
                onClick={handleLimpiar}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Resumen stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
          {[
            { label: 'Total ítems',   val: total,         cls: 'text-[#1e3a5f]' },
            { label: 'Respondidos',   val: `${respondidos}/${total}`, cls: 'text-slate-700' },
            { label: 'Sí (cumple)',   val: si,            cls: 'text-green-700' },
            { label: 'No (brecha)',   val: no,            cls: 'text-red-700' },
            { label: 'N/A',           val: na,            cls: 'text-slate-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
              <div className={`text-2xl font-bold ${c.cls}`}>{c.val}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Barra de cumplimiento general */}
        <div className={`rounded-xl border p-3 mb-5 ${pctBg}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600">Cumplimiento General (Sí / Aplicables)</span>
            <span className={`text-lg font-bold ${pctColor}`}>{si + no > 0 ? `${pct}%` : '—'}</span>
          </div>
          <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : pct > 0 ? 'bg-red-500' : 'bg-slate-200'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {si + no > 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              {si} cumple · {no} no cumple · {na} no aplica · {total - respondidos} sin responder
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-slate-200">
          {([
            { key: 'checklist',  label: '📋 Checklist'     },
            { key: 'resultados', label: '📊 Resultados'    },
            { key: 'plan',       label: `📝 Plan de Trabajo${no > 0 ? ` (${no})` : ''}` },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-[#1e3a5f] text-[#1e3a5f] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Checklist ──────────────────────────────────────────────── */}
        {tab === 'checklist' && (
          <div className="space-y-3">
            {SECCIONES.map(sec => {
              const items = seccionItems(sec.romana)
              const secStat = porSeccion.find(s => s.romana === sec.romana)!
              const isOpen  = seccionOpen === sec.romana
              const respondidosEnSec = secStat.si + secStat.no + secStat.na

              return (
                <div key={sec.romana} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Cabecera sección */}
                  <button
                    onClick={() => setSeccionOpen(isOpen ? '' : sec.romana)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#1e3a5f] text-white hover:bg-[#16304f] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm w-10 text-center bg-white/20 rounded px-1.5 py-0.5">{sec.romana}</span>
                      <span className="font-semibold text-sm">{sec.nombre}</span>
                      <span className="text-[11px] text-white/60">{items.length} ítems</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {secStat.pct >= 0 && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          secStat.pct >= 80 ? 'bg-green-500' : secStat.pct >= 60 ? 'bg-yellow-400 text-yellow-900' : 'bg-red-500'
                        }`}>
                          {secStat.pct}%
                        </span>
                      )}
                      <span className="text-white/60 text-xs">{respondidosEnSec}/{items.length}</span>
                      <span className="text-white/80 text-sm">{isOpen ? '▴' : '▾'}</span>
                    </div>
                  </button>

                  {/* Items de la sección */}
                  {isOpen && (
                    <div className="divide-y divide-slate-100">
                      {items.map((item, idx) => {
                        const r = respuestas[item.id] ?? ''
                        return (
                          <div key={item.id} className={`flex gap-3 px-4 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                            {/* Número */}
                            <div className="w-7 h-7 shrink-0 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-bold flex items-center justify-center mt-0.5">
                              {item.id}
                            </div>
                            {/* Descripción */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700 leading-snug">{item.descripcion}</p>
                              <p className="text-[10px] text-indigo-500 mt-1 leading-tight">{item.cuerpo_legal}</p>
                            </div>
                            {/* Selector */}
                            <div className="shrink-0">
                              <select
                                value={r}
                                onChange={e => handleRespuesta(item.id, e.target.value as Respuesta)}
                                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border cursor-pointer transition-colors ${RESP_COLOR[r]}`}
                              >
                                <option value="">— Seleccionar —</option>
                                <option value="si">✅ Sí</option>
                                <option value="no">❌ No</option>
                                <option value="na">⊘ N/A</option>
                              </select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Tab: Resultados ─────────────────────────────────────────────── */}
        {tab === 'resultados' && (
          <div className="space-y-6">

            {/* Donut + leyenda */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1e3a5f] mb-4">Resumen General de Cumplimiento</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="shrink-0">
                  <DonutChart si={si} no={no} na={na} total={total} pct={pct} />
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Cumple (Sí)',      val: si,  pct: total > 0 ? Math.round(si/total*100)  : 0, color: '#22c55e', bg: 'bg-green-500' },
                    { label: 'No cumple (No)',   val: no,  pct: total > 0 ? Math.round(no/total*100)  : 0, color: '#ef4444', bg: 'bg-red-500'   },
                    { label: 'No aplica (N/A)',  val: na,  pct: total > 0 ? Math.round(na/total*100)  : 0, color: '#94a3b8', bg: 'bg-slate-400' },
                    { label: 'Sin responder',    val: total - respondidos, pct: total > 0 ? Math.round((total-respondidos)/total*100) : 0, color: '#cbd5e1', bg: 'bg-slate-200' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${l.bg}`} />
                      <span className="text-sm text-slate-600 flex-1">{l.label}</span>
                      <span className="text-sm font-bold" style={{ color: l.color }}>{l.val}</span>
                      <span className="text-[11px] text-slate-400 w-9 text-right">{l.pct}%</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                    {si + no > 0
                      ? `Cumplimiento sobre ítems aplicables: ${pct}% (${si} de ${si+no})`
                      : 'Aún no se han respondido ítems aplicables.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Barras por sección */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1e3a5f] mb-4">Cumplimiento por Sección</h2>
              <SeccionBars stats={porSeccion} />
            </div>

            {/* Tabla resumen */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
              <h2 className="text-sm font-bold text-[#1e3a5f] mb-3">Tabla de Resultados</h2>
              <TablaResultados stats={porSeccion} pct={pct} />
            </div>

            {/* Brechas: ítems No */}
            {no > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-red-800 mb-3">🚨 Brechas Detectadas ({no} ítems)</h2>
                <div className="space-y-2">
                  {ITEMS.filter(i => respuestas[i.id] === 'no').map(item => (
                    <div key={item.id} className="flex gap-2 text-xs">
                      <span className="shrink-0 font-bold text-red-700 w-6 text-center">{item.id}</span>
                      <div>
                        <p className="text-red-800 leading-snug">{item.descripcion}</p>
                        <p className="text-red-400 mt-0.5">{item.cuerpo_legal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nota legal */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500">
              <strong>Nota:</strong> El listado de autoevaluación contempla sólo algunos aspectos de la normativa de SST, siendo parte del proceso inicial de detección de brechas. El organismo administrador deberá proporcionar asistencia técnica según resultados de la aplicación.
            </div>
          </div>
        )}

        {/* ── Tab: Plan de Trabajo ────────────────────────────────────────── */}
        {tab === 'plan' && (
          <div className="space-y-5">
            {no === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-800 font-semibold text-base">¡Sin brechas detectadas!</p>
                <p className="text-green-600 text-sm mt-1">Todos los ítems aplicables cumplen con la normativa.</p>
              </div>
            ) : (
              <>
                {/* Encabezado del plan */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#1e3a5f]">Plan de Trabajo — Cierre de Brechas</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {no} brecha{no !== 1 ? 's' : ''} detectada{no !== 1 ? 's' : ''} · Asigna responsable y fecha de compromiso para cada una
                      </p>
                    </div>
                    {/* Resumen estado del plan */}
                    <div className="flex gap-2 text-[11px]">
                      {(['pendiente','en_progreso','completado'] as PlanItem['estado'][]).map(e => {
                        const count = ITEMS.filter(i => respuestas[i.id] === 'no' && (plan[i.id]?.estado ?? 'pendiente') === e).length
                        return count > 0 ? (
                          <span key={e} className={`px-2 py-1 rounded-full border font-semibold ${PLAN_ESTADO_STYLE[e]}`}>
                            {PLAN_ESTADO_LABEL[e]}: {count}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>

                {/* Tabla de brechas con plan */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#1e3a5f] text-white">
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-8">N°</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a]">Brecha / Requisito No Cumplido</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-24">Artículo</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-36">Responsable</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-28">F. Programada</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-28">F. Efectiva</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-32">Estado</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a]">Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ITEMS.filter(i => respuestas[i.id] === 'no').map((item, idx) => {
                          const p = plan[item.id] ?? PLAN_DEFAULT
                          const bg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          return (
                            <tr key={item.id} className={bg}>
                              <td className="px-3 py-2 border border-slate-200 font-bold text-[#1e3a5f] text-center align-top">{item.id}</td>
                              <td className="px-3 py-2 border border-slate-200 leading-snug align-top max-w-[240px]">
                                <p className="text-slate-700">{item.descripcion}</p>
                              </td>
                              <td className="px-3 py-2 border border-slate-200 text-[10px] text-indigo-500 align-top">{item.cuerpo_legal}</td>
                              <td className="px-2 py-1.5 border border-slate-200 align-top">
                                <input
                                  type="text"
                                  value={p.responsable}
                                  onChange={e => handlePlanUpdate(item.id, 'responsable', e.target.value)}
                                  placeholder="Nombre responsable"
                                  className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                                />
                              </td>
                              <td className="px-2 py-1.5 border border-slate-200 align-top">
                                <input
                                  type="date"
                                  value={p.fecha_inicio}
                                  onChange={e => handlePlanUpdate(item.id, 'fecha_inicio', e.target.value)}
                                  className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                                />
                              </td>
                              <td className="px-2 py-1.5 border border-slate-200 align-top">
                                <input
                                  type="date"
                                  value={p.fecha_compromiso}
                                  onChange={e => handlePlanUpdate(item.id, 'fecha_compromiso', e.target.value)}
                                  className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                                />
                              </td>
                              <td className="px-2 py-1.5 border border-slate-200 align-top">
                                <select
                                  value={p.estado}
                                  onChange={e => handlePlanUpdate(item.id, 'estado', e.target.value)}
                                  className={`w-full text-xs font-semibold px-2 py-1 rounded border cursor-pointer ${PLAN_ESTADO_STYLE[p.estado]}`}
                                >
                                  <option value="pendiente">Pendiente</option>
                                  <option value="en_progreso">En Progreso</option>
                                  <option value="completado">Completado</option>
                                </select>
                              </td>
                              <td className="px-2 py-1.5 border border-slate-200 align-top">
                                <input
                                  type="text"
                                  value={p.observacion}
                                  onChange={e => handlePlanUpdate(item.id, 'observacion', e.target.value)}
                                  placeholder="Observación opcional..."
                                  className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Nota */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-800">
                  <strong>ℹ Nota:</strong> Los cambios en el plan se guardan automáticamente. Usa el botón <strong>Guardar</strong> del encabezado para asegurarte de no perder la información.
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Estilos de impresión ─────────────────────────────────────────── */}
      <style>{`
        @page { margin: 0; size: A4 portrait; }
        @media print {
          body * { visibility: hidden; }
          .print-content {
            display: block !important;
            visibility: visible;
            position: absolute;
            top: 0; left: 0;
            width: 100%;
          }
          .print-content * { visibility: visible; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
    </>
  )
}
