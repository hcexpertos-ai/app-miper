'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/src/store/app-store'
import {
  ITEMS_FUF, SECCIONES_FUF,
  type RespuestaFuf,
} from '@/src/lib/fuf-data'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Respuestas = Record<number, RespuestaFuf>

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
  id:      string
  nombre:  string
  total:   number
  cumple:  number
  no:      number
  na:      number
  pct:     number  // cumple / (cumple+no) * 100, -1 si sin aplicables
}

// ─── Cálculos ─────────────────────────────────────────────────────────────────

function calcStats(respuestas: Respuestas): {
  total: number; respondidos: number
  cumple: number; no: number; na: number
  aplicables: number; pct: number
  porSeccion: SeccionStats[]
} {
  const total = ITEMS_FUF.length

  let cumple = 0, no = 0, na = 0
  for (const v of Object.values(respuestas)) {
    if (v === 'cumple')    cumple++
    else if (v === 'no_cumple') no++
    else if (v === 'no_aplica') na++
  }
  const respondidos = cumple + no + na
  const aplicables  = cumple + no
  const pct         = aplicables > 0 ? Math.round((cumple / aplicables) * 100) : 0

  const porSeccion: SeccionStats[] = SECCIONES_FUF.map(sec => {
    const items = ITEMS_FUF.filter(i => i.seccion_id === sec.id)
    let c = 0, n = 0, a = 0
    for (const item of items) {
      const r = respuestas[item.id]
      if (r === 'cumple')    c++
      else if (r === 'no_cumple') n++
      else if (r === 'no_aplica') a++
    }
    const ap = c + n
    return {
      id: sec.id, nombre: sec.nombre,
      total: items.length, cumple: c, no: n, na: a,
      pct: ap > 0 ? Math.round((c / ap) * 100) : -1,
    }
  })

  return { total, respondidos, cumple, no, na, aplicables, pct, porSeccion }
}

// ─── Donut Chart SVG ──────────────────────────────────────────────────────────

function DonutChart({ cumple, no, na, total, pct }: {
  cumple: number; no: number; na: number; total: number; pct: number
}) {
  const SIZE = 200, cx = 100, cy = 100, R = 78, rIn = 52
  const sinResp = total - cumple - no - na
  const segs = [
    { v: cumple,  color: '#22c55e' },
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
    const start = angle
    const delta = (seg.v / sum) * 2 * Math.PI
    angle += delta
    const end   = angle
    const large = delta > Math.PI ? 1 : 0

    const x1  = cx + R    * Math.cos(start), y1  = cy + R    * Math.sin(start)
    const x2  = cx + R    * Math.cos(end),   y2  = cy + R    * Math.sin(end)
    const xi1 = cx + rIn  * Math.cos(end),   yi1 = cy + rIn  * Math.sin(end)
    const xi2 = cx + rIn  * Math.cos(start), yi2 = cy + rIn  * Math.sin(start)

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
          <text x={cx} y={cy + 25} textAnchor="middle" fontSize="9" fill="#94a3b8">({cumple} de {cumple+no} aplic.)</text>
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
      {stats.map((s, i) => {
        const pct   = s.pct < 0 ? 0 : s.pct
        const color = s.pct < 0 ? 'bg-slate-200' : s.pct >= 80 ? 'bg-green-500' : s.pct >= 60 ? 'bg-yellow-400' : 'bg-red-500'
        const txt   = s.pct < 0 ? '—' : `${s.pct}%`
        return (
          <div key={s.id}>
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="font-semibold text-slate-700 truncate max-w-[220px]">
                <span className="text-[#1e3a5f] font-bold mr-1">S{i + 1}.</span>{s.nombre}
              </span>
              <span className="font-bold text-[11px] ml-2 whitespace-nowrap" style={{ color: s.pct < 0 ? '#94a3b8' : s.pct >= 80 ? '#16a34a' : s.pct >= 60 ? '#d97706' : '#dc2626' }}>
                {txt}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5">
              <span className="text-green-600">✔ {s.cumple}</span>
              <span className="text-red-500">✖ {s.no}</span>
              <span className="text-slate-400">⊘ {s.na}</span>
              <span className="ml-auto">{s.cumple + s.no + s.na}/{s.total}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tabla de resultados ──────────────────────────────────────────────────────

function TablaResultados({ stats, pct }: { stats: SeccionStats[]; pct: number }) {
  const totCumple = stats.reduce((a, s) => a + s.cumple, 0)
  const totNo     = stats.reduce((a, s) => a + s.no,     0)
  const totNa     = stats.reduce((a, s) => a + s.na,     0)
  const totTot    = stats.reduce((a, s) => a + s.total,  0)

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-[#1e3a5f] text-white">
          {['N°','Sección','Total','Cumple','No Cumple','No Aplica','% Cumpl.'].map(h => (
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
            <tr key={s.id} className={bg}>
              <td className="px-2 py-1.5 border border-slate-200 font-bold text-[#1e3a5f]">S{i + 1}</td>
              <td className="px-2 py-1.5 border border-slate-200 max-w-[200px] leading-snug">{s.nombre}</td>
              <td className="px-2 py-1.5 border border-slate-200 text-center">{s.total}</td>
              <td className="px-2 py-1.5 border border-slate-200 text-center text-green-700 font-semibold">{s.cumple}</td>
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
          <td className="px-2 py-1.5 border border-slate-300 text-center text-green-700">{totCumple}</td>
          <td className="px-2 py-1.5 border border-slate-300 text-center text-red-700">{totNo}</td>
          <td className="px-2 py-1.5 border border-slate-300 text-center text-slate-500">{totNa}</td>
          <td className={`px-2 py-1.5 border border-slate-300 text-center font-bold ${pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
            {totCumple + totNo > 0 ? `${pct}%` : '—'}
          </td>
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
  const stats  = calcStats(respuestas)
  const grupos = SECCIONES_FUF.map((sec, idx) => ({
    ...sec,
    num:   idx + 1,
    items: ITEMS_FUF.filter(i => i.seccion_id === sec.id),
  }))

  const RESP_LABEL: Record<RespuestaFuf, string> = {
    cumple:    'Cumple',
    no_cumple: 'No Cumple',
    no_aplica: 'No Aplica',
    '':        '—',
  }

  return (
    <div className="font-sans text-[11px] text-slate-800 bg-white" style={{ padding: '0.6cm 0.8cm', width: 820 }}>

      {/* ── Encabezado: franja azul con logo (logo blanco visible sobre fondo oscuro) ── */}
      <div style={{ background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', marginBottom: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="PRSO Logo" style={{ height: 52, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            FUF DS 44 — Formulario Único de Fiscalización
          </div>
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.85 }}>DS N°44/2024 · Inspección del Trabajo</div>
          <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>Ley N°16.744 · Seguridad y Salud en el Trabajo</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, opacity: 0.8, whiteSpace: 'nowrap' }}>
          <div>Fecha: {fecha}</div>
        </div>
      </div>

      {/* Datos empresa */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-[10px] border border-slate-200 rounded p-2">
        <div><span className="font-semibold">Empresa / Razón Social:</span> {empresa || '—'}</div>
        <div><span className="font-semibold">Centro de Trabajo:</span> {centro || '—'}</div>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Ítems',        val: stats.total,      color: '#1e3a5f' },
          { label: 'Cumple',             val: stats.cumple,     color: '#16a34a' },
          { label: 'No Cumple',          val: stats.no,         color: '#dc2626' },
          { label: '% Cumplimiento',     val: stats.pct >= 0 ? `${stats.pct}%` : '—', color: stats.pct >= 80 ? '#16a34a' : stats.pct >= 60 ? '#d97706' : '#dc2626' },
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

      {/* Checklist completo por sección */}
      {grupos.map(sec => (
        <div key={sec.id} className="mb-4">
          <div className="bg-[#1e3a5f] text-white px-3 py-1.5 font-bold text-[10px] uppercase tracking-wide rounded-t">
            S{sec.num}. {sec.nombre}
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-6">N°</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px]">Descripción / Requisito</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-24">Artículo</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-12">Cumple</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-14">No Cumple</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-12">No Aplica</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item, idx) => {
                const r  = respuestas[item.id] ?? ''
                const bg = idx % 2 === 0 ? '' : 'bg-slate-50/50'
                return (
                  <tr key={item.id} className={bg}>
                    <td className="px-2 py-1.5 border border-slate-200 font-bold text-center text-[#1e3a5f] align-top">{item.id}</td>
                    <td className="px-2 py-1.5 border border-slate-200 leading-snug align-top">
                      <span className="whitespace-pre-line">{item.descripcion}</span>
                      {item.nota && (
                        <div className="mt-1 text-[8px] text-indigo-600 italic leading-tight">
                          ℹ {item.nota}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] text-slate-500 leading-tight align-top">{item.articulo}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-center align-top font-bold text-green-700">{r === 'cumple'    ? '✓' : ''}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-center align-top font-bold text-red-600">{r === 'no_cumple' ? '✓' : ''}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-center align-top font-bold text-slate-400">{r === 'no_aplica' ? '✓' : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Brechas detectadas */}
      {stats.no > 0 && (
        <div className="mt-4 p-3 border border-red-300 bg-red-50 rounded">
          <div className="font-bold text-red-800 text-[10px] mb-2">BRECHAS DETECTADAS — {stats.no} ítem(s) No Cumplen:</div>
          {ITEMS_FUF.filter(i => respuestas[i.id] === 'no_cumple').map(item => (
            <div key={item.id} className="flex gap-2 text-[9px] mb-1">
              <span className="shrink-0 font-bold text-red-700 w-5 text-right">{item.id}.</span>
              <span className="text-red-800 leading-snug">{item.descripcion.split('\n')[0]}</span>
              <span className="ml-auto shrink-0 text-red-400">{item.articulo}</span>
            </div>
          ))}
        </div>
      )}

      {/* Plan de Trabajo */}
      {ITEMS_FUF.filter(i => respuestas[i.id] === 'no_cumple').length > 0 && (
        <div className="mt-6">
          <div className="bg-[#1e3a5f] text-white px-3 py-1.5 font-bold text-[10px] uppercase tracking-wide rounded-t">
            Plan de Trabajo — Cierre de Brechas FUF DS 44
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-6">N°</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px]">Brecha / Requisito No Cumplido</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-20">Artículo</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-24">Responsable</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-18">F. Inicio</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px] w-20">F. Compromiso</th>
                <th className="px-2 py-1 border border-slate-300 text-center text-[9px] w-18">Estado</th>
                <th className="px-2 py-1 border border-slate-300 text-left text-[9px]">Observación</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS_FUF.filter(i => respuestas[i.id] === 'no_cumple').map((item, idx) => {
                const p  = plan[item.id] ?? PLAN_DEFAULT
                const bg = idx % 2 === 0 ? '' : 'bg-slate-50/50'
                return (
                  <tr key={item.id} className={bg}>
                    <td className="px-2 py-1.5 border border-slate-200 font-bold text-center text-[#1e3a5f] align-top">{item.id}</td>
                    <td className="px-2 py-1.5 border border-slate-200 leading-snug align-top text-[9px]">{item.descripcion.split('\n')[0]}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-[9px] text-slate-500 align-top">{item.articulo}</td>
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
        {['Evaluador', 'Representante Legal'].map(f => (
          <div key={f}>
            <div style={{ height: 52 }} />
            <div className="border-t-2 border-slate-500 pt-2">
              <p className="text-[10px] font-bold text-slate-700 text-center">{f}</p>
              <p className="text-[9px] text-slate-400 text-center mt-0.5">Nombre y firma</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[8px] text-slate-400 text-center border-t border-slate-200 pt-2">
        Formulario Único de Fiscalización · DS N°44/2024 · Inspección del Trabajo · Generado con App MIPER · {fecha}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FufPage() {
  const { empresa, centro } = useAppStore()

  const [respuestas,  setRespuestas]  = useState<Respuestas>({})
  const [plan,        setPlan]        = useState<Plan>({})
  const [tab,         setTab]         = useState<'checklist' | 'resultados' | 'plan'>('checklist')
  const [seccionOpen, setSeccionOpen] = useState<string>('S1')
  const [guardando,   setGuardando]   = useState(false)
  const [guardadoOk,  setGuardadoOk]  = useState(false)
  const [fechaEval,   setFechaEval]   = useState(() => new Date().toISOString().split('T')[0])

  const printRef = useRef<HTMLDivElement>(null)

  const lsKey = `fuf_${empresa?.id ?? 'default'}`

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

  // ── Guardar respuesta individual ────────────────────────────────────────
  const handleRespuesta = useCallback((id: number, valor: RespuestaFuf) => {
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
    if (!confirm('¿Deseas limpiar todas las respuestas del FUF? Esta acción no se puede deshacer.')) return
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

    printRef.current.style.display = 'block'
    printRef.current.style.width   = '820px'
    await new Promise(r => setTimeout(r, 150))

    const canvas = await html2canvas(printRef.current, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 820,
    })
    printRef.current.style.display = 'none'
    printRef.current.style.width   = ''

    const pdf  = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
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
    pdf.save(`FUF_DS44_${nombre}_${fechaEval}.pdf`)
  }

  // ── Estadísticas ────────────────────────────────────────────────────────
  const stats = calcStats(respuestas)
  const { total, respondidos, cumple, no, na, pct, porSeccion } = stats

  const pctColor = pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-yellow-600' : pct > 0 ? 'text-red-700' : 'text-slate-400'
  const pctBg    = pct >= 80 ? 'bg-green-50 border-green-200' : pct >= 60 ? 'bg-yellow-50 border-yellow-200' : pct > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'

  const RESP_COLOR: Record<RespuestaFuf, string> = {
    cumple:    'bg-green-100 text-green-800 border-green-300',
    no_cumple: 'bg-red-100 text-red-800 border-red-300',
    no_aplica: 'bg-slate-100 text-slate-600 border-slate-300',
    '':        'bg-white text-slate-500 border-slate-200',
  }

  return (
    <>
      {/* ── Área solo para impresión / PDF ──────────────────────────────── */}
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
              <h1 className="text-xl font-bold text-[#1e3a5f]">FUF DS 44 — Formulario Único de Fiscalización</h1>
              <p className="text-sm text-slate-500 mt-0.5">DS N°44/2024 · Inspección del Trabajo · 60 ítems en 15 secciones</p>
              {empresa && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {empresa.razon_social}{centro ? ` · ${centro.nombre}` : ''}
                </p>
              )}
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
            { label: 'Total ítems',    val: total,                    cls: 'text-[#1e3a5f]' },
            { label: 'Respondidos',    val: `${respondidos}/${total}`, cls: 'text-slate-700' },
            { label: 'Cumple',         val: cumple,                   cls: 'text-green-700' },
            { label: 'No Cumple',      val: no,                       cls: 'text-red-700'   },
            { label: 'No Aplica',      val: na,                       cls: 'text-slate-500' },
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
            <span className="text-xs font-semibold text-slate-600">Cumplimiento General (Cumple / Aplicables)</span>
            <span className={`text-lg font-bold ${pctColor}`}>{cumple + no > 0 ? `${pct}%` : '—'}</span>
          </div>
          <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : pct > 0 ? 'bg-red-500' : 'bg-slate-200'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {cumple + no > 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              {cumple} cumple · {no} no cumple · {na} no aplica · {total - respondidos} sin responder
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-slate-200">
          {([
            { key: 'checklist',  label: '📋 Checklist FUF'  },
            { key: 'resultados', label: '📊 Resultados'     },
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
            {SECCIONES_FUF.map((sec, secIdx) => {
              const items    = ITEMS_FUF.filter(i => i.seccion_id === sec.id)
              const secStat  = porSeccion.find(s => s.id === sec.id)!
              const isOpen   = seccionOpen === sec.id
              const respEnSec = secStat.cumple + secStat.no + secStat.na

              return (
                <div key={sec.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Cabecera sección */}
                  <button
                    onClick={() => setSeccionOpen(isOpen ? '' : sec.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#1e3a5f] text-white hover:bg-[#16304f] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-sm w-10 text-center bg-white/20 rounded px-1.5 py-0.5 shrink-0">
                        S{secIdx + 1}
                      </span>
                      <span className="font-semibold text-sm text-left truncate">{sec.nombre}</span>
                      <span className="text-[11px] text-white/60 shrink-0">{items.length} ítems</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {secStat.pct >= 0 && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          secStat.pct >= 80 ? 'bg-green-500' : secStat.pct >= 60 ? 'bg-yellow-400 text-yellow-900' : 'bg-red-500'
                        }`}>
                          {secStat.pct}%
                        </span>
                      )}
                      <span className="text-white/60 text-xs">{respEnSec}/{items.length}</span>
                      <span className="text-white/80 text-sm">{isOpen ? '▴' : '▾'}</span>
                    </div>
                  </button>

                  {/* Items */}
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
                              <p className="text-sm text-slate-700 leading-snug whitespace-pre-line">{item.descripcion}</p>
                              <p className="text-[10px] text-indigo-500 mt-1 leading-tight">{item.articulo}</p>
                              {item.nota && (
                                <div className="mt-1.5 flex gap-1.5 bg-indigo-50 border border-indigo-100 rounded px-2 py-1.5">
                                  <span className="text-indigo-400 shrink-0 mt-0.5">ℹ</span>
                                  <p className="text-[10px] text-indigo-700 leading-snug">{item.nota}</p>
                                </div>
                              )}
                            </div>
                            {/* Selector */}
                            <div className="shrink-0">
                              <select
                                value={r}
                                onChange={e => handleRespuesta(item.id, e.target.value as RespuestaFuf)}
                                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border cursor-pointer transition-colors ${RESP_COLOR[r]}`}
                              >
                                <option value="">— Seleccionar —</option>
                                <option value="cumple">✔ Cumple</option>
                                <option value="no_cumple">✖ No Cumple</option>
                                <option value="no_aplica">⊘ No Aplica</option>
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
                  <DonutChart cumple={cumple} no={no} na={na} total={total} pct={pct} />
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Cumple',        val: cumple,            pct: total > 0 ? Math.round(cumple/total*100) : 0, color: '#22c55e', bg: 'bg-green-500'  },
                    { label: 'No Cumple',     val: no,                pct: total > 0 ? Math.round(no/total*100)     : 0, color: '#ef4444', bg: 'bg-red-500'    },
                    { label: 'No Aplica',     val: na,                pct: total > 0 ? Math.round(na/total*100)     : 0, color: '#94a3b8', bg: 'bg-slate-400'  },
                    { label: 'Sin responder', val: total - respondidos, pct: total > 0 ? Math.round((total-respondidos)/total*100) : 0, color: '#cbd5e1', bg: 'bg-slate-200' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${l.bg}`} />
                      <span className="text-sm text-slate-600 flex-1">{l.label}</span>
                      <span className="text-sm font-bold" style={{ color: l.color }}>{l.val}</span>
                      <span className="text-[11px] text-slate-400 w-9 text-right">{l.pct}%</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                    {cumple + no > 0
                      ? `Cumplimiento sobre ítems aplicables: ${pct}% (${cumple} de ${cumple + no})`
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

            {/* Brechas: ítems No Cumple */}
            {no > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-red-800 mb-3">🚨 Brechas Detectadas — No Cumple ({no} ítems)</h2>
                <div className="space-y-2.5">
                  {ITEMS_FUF.filter(i => respuestas[i.id] === 'no_cumple').map(item => (
                    <div key={item.id} className="flex gap-2 text-xs bg-white rounded-lg border border-red-100 p-2.5">
                      <span className="shrink-0 font-bold text-red-700 w-6 text-center">{item.id}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-red-800 leading-snug whitespace-pre-line">{item.descripcion}</p>
                        <p className="text-red-400 mt-0.5">{item.articulo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nota informativa */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500">
              <strong>Nota:</strong> El Formulario Único de Fiscalización (FUF) corresponde al instrumento DS N°44/2024 de la Dirección del Trabajo para verificar el cumplimiento de las obligaciones de Seguridad y Salud en el Trabajo (SST) establecidas en el DS N°44 del Ministerio del Trabajo y Previsión Social. El resultado de esta evaluación es de carácter referencial y no reemplaza la visita inspectiva oficial.
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
                <p className="text-green-600 text-sm mt-1">Todos los ítems aplicables del FUF cumplen con la normativa DS N°44.</p>
              </div>
            ) : (
              <>
                {/* Encabezado del plan */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#1e3a5f]">Plan de Trabajo — Cierre de Brechas FUF DS 44</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {no} brecha{no !== 1 ? 's' : ''} detectada{no !== 1 ? 's' : ''} · Asigna responsable y fecha de compromiso para cada ítem No Cumple
                      </p>
                    </div>
                    {/* Resumen estado del plan */}
                    <div className="flex gap-2 text-[11px] flex-wrap">
                      {(['pendiente','en_progreso','completado'] as PlanItem['estado'][]).map(e => {
                        const count = ITEMS_FUF.filter(i => respuestas[i.id] === 'no_cumple' && (plan[i.id]?.estado ?? 'pendiente') === e).length
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
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-28">F. Inicio</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-28">F. Compromiso</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a] w-32">Estado</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#2a4f7a]">Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ITEMS_FUF.filter(i => respuestas[i.id] === 'no_cumple').map((item, idx) => {
                          const p  = plan[item.id] ?? PLAN_DEFAULT
                          const bg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          return (
                            <tr key={item.id} className={bg}>
                              <td className="px-3 py-2 border border-slate-200 font-bold text-[#1e3a5f] text-center align-top">{item.id}</td>
                              <td className="px-3 py-2 border border-slate-200 leading-snug align-top max-w-[240px]">
                                <p className="text-slate-700 whitespace-pre-line">{item.descripcion.split('\n')[0]}</p>
                                {item.nota && (
                                  <p className="text-[10px] text-indigo-500 mt-0.5 italic">{item.nota}</p>
                                )}
                              </td>
                              <td className="px-3 py-2 border border-slate-200 text-[10px] text-indigo-500 align-top">{item.articulo}</td>
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
