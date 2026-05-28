'use client'

import { useState } from 'react'
import { useAppStore } from '@/src/store/app-store'
import {
  exportLevantamientoExcel,
  exportMiperExcel,
  exportProgramaExcel,
} from '@/src/lib/reports/excel-reports'
import {
  LABEL_TIPO_PROCESO, LABEL_PROBABILIDAD, LABEL_CONSECUENCIA,
  LABEL_CONTROL, LABEL_ESTADO, COLOR_ESTADO,
  LABEL_CATALOGO_RIESGO, categoriaEvaluacion,
  type Empresa, type CentroTrabajo,
  type ClasificacionRiesgo, type EstadoPrograma,
} from '@/src/types'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Reporte = 'levantamiento' | 'miper' | 'programa'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtFecha = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const fmtHoy = () =>
  new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

// ─── Sub-componentes UI ───────────────────────────────────────────────────────

function TabBtn({ label, icon, activo, onClick }: {
  label: string; icon: string; activo: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
        ${activo
          ? 'bg-[#1e3a5f] text-white shadow'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// ─── Cabecera de cada informe ─────────────────────────────────────────────────

function ReportHeader({
  titulo, subtitulo, empresa, centro, fecha,
}: {
  titulo: string; subtitulo: string
  empresa: Empresa | null
  centro:  CentroTrabajo | null
  fecha: string
}) {
  return (
    <div className="mb-6">
      {/* Banda azul superior */}
      <div className="bg-[#1e3a5f] text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight">{titulo}</h1>
            <p className="text-xs text-white/70 mt-0.5">{subtitulo}</p>
          </div>
          <div className="text-right text-xs text-white/60 shrink-0">
            <div className="font-semibold text-white/90">App MIPER · DS 44</div>
            <div>Fecha: {fecha}</div>
          </div>
        </div>
      </div>

      {/* Datos empresa / centro */}
      <div className="grid grid-cols-2 gap-0 border border-t-0 border-slate-300 rounded-b-lg overflow-hidden text-sm">
        <div className="px-4 py-3 border-r border-slate-200 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Empresa</p>
          <p className="font-semibold text-slate-800">{empresa?.razon_social ?? '—'}</p>
          <p className="text-slate-500">RUT: {empresa?.rut ?? '—'}</p>
          <p className="text-slate-500 text-xs">{empresa?.actividad_economica ?? ''}</p>
        </div>
        <div className="px-4 py-3 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Centro de Trabajo</p>
          <p className="font-semibold text-slate-800">{centro?.nombre ?? '—'}</p>
          <p className="text-slate-500">{centro?.direccion ?? '—'}</p>
          <p className="text-slate-500 text-xs">
            Total trabajadores: {(centro?.n_trabajadores_hombres ?? 0) +
              (centro?.n_trabajadores_mujeres ?? 0) + (centro?.n_trabajadores_otro ?? 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Área de firmas ───────────────────────────────────────────────────────────

function FirmaArea({ firmantes }: { firmantes: string[] }) {
  return (
    <div className="mt-10 pt-6 border-t border-slate-200">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-6">Firmas</p>
      <div className={`grid gap-8 ${firmantes.length === 2 ? 'grid-cols-2' : firmantes.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {firmantes.map((f, i) => (
          <div key={i} className="text-center">
            <div className="h-14 border-b border-slate-400 mb-2" />
            <p className="text-xs font-medium text-slate-700">{f}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// INFORME 1: LEVANTAMIENTO DE PROCESOS
// Formato exacto DS 44 — una fila por tarea, columnas separadas sin mezclar
// ══════════════════════════════════════════════════════════════════════════════

function InformeLevantamiento() {
  const { empresa, centro, procesos, tareas } = useAppStore()
  const fecha = fmtHoy()

  if (!empresa) return <SinDatos />

  // Construir filas planas: una por tarea con datos del proceso
  const filas = procesos.flatMap(proceso =>
    tareas
      .filter(t => t.proceso_id === proceso.id)
      .map(t => ({ proceso, tarea: t }))
  )

  return (
    <div className="report-doc">
      <ReportHeader
        titulo="LEVANTAMIENTO DE PROCESOS, ACTIVIDADES Y TAREAS"
        subtitulo="Módulo 1 · DS 44 · Ley 16.744 — Identificación de Peligros"
        empresa={empresa}
        centro={centro}
        fecha={fecha}
      />

      {/* Metadata de levantamiento */}
      {procesos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2">
            <span className="text-slate-500">Responsable levantamiento:</span>{' '}
            <strong className="text-slate-700">
              {procesos.map(p => p.responsable_levantamiento).filter(Boolean).join(' / ') || '—'}
            </strong>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2">
            <span className="text-slate-500">Fecha levantamiento:</span>{' '}
            <strong className="text-slate-700">
              {fmtFecha(procesos[0]?.fecha_levantamiento ?? '')}
            </strong>
          </div>
        </div>
      )}

      {filas.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Sin tareas registradas</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-300">
          <table className="w-full text-[11px] border-collapse">
            {/* ── Encabezado doble (colspan/rowspan) ── */}
            <thead>
              <tr className="bg-[#1e3a5f] text-white">
                <th className="px-3 py-3 text-left font-semibold border border-[#2d5180] whitespace-nowrap" rowSpan={2}>
                  Proceso
                </th>
                <th className="px-3 py-3 text-left font-semibold border border-[#2d5180] whitespace-nowrap" rowSpan={2}>
                  Tipo de<br/>proceso
                </th>
                <th className="px-3 py-3 text-left font-semibold border border-[#2d5180] whitespace-nowrap" rowSpan={2}>
                  Puesto de trabajo
                </th>
                <th className="px-3 py-3 text-left font-semibold border border-[#2d5180]" rowSpan={2}>
                  Tarea
                </th>
                <th className="px-3 py-3 text-center font-semibold border border-[#2d5180] whitespace-nowrap" rowSpan={2}>
                  Rutinaria /<br/>No rutinaria
                </th>
                <th className="px-3 py-3 text-left font-semibold border border-[#2d5180] whitespace-nowrap" rowSpan={2}>
                  Lugar de<br/>ejecución
                </th>
                <th className="px-3 py-3 text-center font-semibold border border-[#2d5180]" colSpan={3}>
                  N° Trabajadores Expuestos<br/>
                  <span className="text-[9px] font-normal text-white/70">Identidad Sexogenérica</span>
                </th>
                <th className="px-3 py-3 text-left font-semibold border border-[#2d5180]" rowSpan={2}>
                  Observaciones
                </th>
              </tr>
              <tr className="bg-[#2d5180] text-white text-center">
                <th className="px-4 py-2 font-bold border border-[#3a6290] text-blue-200">H</th>
                <th className="px-4 py-2 font-bold border border-[#3a6290] text-pink-200">M</th>
                <th className="px-4 py-2 font-bold border border-[#3a6290] text-purple-200">Otro</th>
              </tr>
            </thead>

            {/* ── Cuerpo: una fila por tarea ── */}
            <tbody>
              {filas.map(({ proceso, tarea }, i) => (
                <tr
                  key={tarea.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  {/* Proceso */}
                  <td className="px-3 py-2.5 border border-slate-200 font-medium text-slate-800 align-top">
                    {proceso.nombre}
                  </td>
                  {/* Tipo de proceso */}
                  <td className="px-3 py-2.5 border border-slate-200 align-top whitespace-nowrap">
                    {LABEL_TIPO_PROCESO[proceso.tipo]}
                  </td>
                  {/* Puesto de trabajo */}
                  <td className="px-3 py-2.5 border border-slate-200 align-top">
                    {tarea.puesto_trabajo}
                  </td>
                  {/* Tarea */}
                  <td className="px-3 py-2.5 border border-slate-200 align-top font-medium text-slate-700">
                    {tarea.actividad}
                  </td>
                  {/* Rutinaria */}
                  <td className="px-3 py-2.5 border border-slate-200 text-center align-top">
                    {tarea.es_rutinaria ? 'Rutinaria' : 'No rutinaria'}
                  </td>
                  {/* Lugar ejecución */}
                  <td className="px-3 py-2.5 border border-slate-200 align-top">
                    {tarea.lugar_ejecucion}
                  </td>
                  {/* H */}
                  <td className="px-3 py-2.5 border border-slate-200 text-center font-bold text-blue-700 align-top">
                    {tarea.n_trabajadores_hombres}
                  </td>
                  {/* M */}
                  <td className="px-3 py-2.5 border border-slate-200 text-center font-bold text-pink-700 align-top">
                    {tarea.n_trabajadores_mujeres}
                  </td>
                  {/* Otro */}
                  <td className="px-3 py-2.5 border border-slate-200 text-center font-bold text-purple-700 align-top">
                    {tarea.n_trabajadores_otro}
                  </td>
                  {/* Observaciones */}
                  <td className="px-3 py-2.5 border border-slate-200 align-top text-slate-600">
                    {tarea.observaciones ||
                      [tarea.equipos_involucrados, tarea.materiales_sustancias]
                        .filter(Boolean).join(' · ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FirmaArea firmantes={['Responsable Levantamiento', 'Representante de la Empresa', 'Prevencionista de Riesgos']} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// INFORME 2: MIPER — Formato Oficial Anexo N°6 DS 44
// ══════════════════════════════════════════════════════════════════════════════

function InformeMiper() {
  const { empresa, centro, procesos, tareas, miperRegistros } = useAppStore()
  const [filtroProceso, setFiltroProceso] = useState<string>('todos')
  const fecha = fmtHoy()

  if (!empresa) return <SinDatos />

  const registros = filtroProceso === 'todos'
    ? miperRegistros
    : miperRegistros.filter(m => {
        const t = tareas.find(t => t.id === m.tarea_id)
        return t?.proceso_id === filtroProceso
      })

  const procesoFiltrado = procesos.find(p => p.id === filtroProceso)
  const responsable = procesos[0]?.responsable_levantamiento ?? '—'

  // Valores numéricos P y S
  const pNum = (p: string) => p === 'baja' ? 1 : p === 'media' ? 2 : 4
  const sNum = (c: string) => c === 'ligeramente_danino' ? 1 : c === 'danino' ? 2 : 4

  const riesgoClass: Record<string, string> = {
    tolerable:   'riesgo-tolerable',
    moderado:    'riesgo-moderado',
    importante:  'riesgo-importante',
    intolerable: 'riesgo-intolerable',
  }
  const riesgoLabel: Record<string, string> = {
    tolerable:   'Tolerable',
    moderado:    'Moderado',
    importante:  'Importante',
    intolerable: 'Intolerable',
  }

  // Cabecera de columna común
  const TH3 = ({ children, cls = '' }: { children: React.ReactNode; cls?: string }) => (
    <th className={`border border-[#1e3a5f]/40 px-2 py-2 text-center text-[9px] font-bold text-white whitespace-nowrap ${cls}`}>
      {children}
    </th>
  )
  const TH3Y = ({ children, cls = '' }: { children: React.ReactNode; cls?: string }) => (
    <th className={`border border-[#b8860b]/40 px-2 py-2 text-center text-[9px] font-bold text-[#7a5c00] whitespace-nowrap bg-[#ffd966] ${cls}`}>
      {children}
    </th>
  )

  return (
    <div className="report-doc">

      {/* ── Filtro (solo pantalla) ─────────────────────────────────────────── */}
      <div className="no-print mb-4 flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">
          Filtrar proceso:
        </label>
        <select value={filtroProceso} onChange={e => setFiltroProceso(e.target.value)} className="select max-w-xs">
          <option value="todos">Todos los procesos</option>
          {procesos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <span className="text-xs text-slate-400">{registros.length} registros</span>
      </div>

      {/* ── Título oficial ─────────────────────────────────────────────────── */}
      <div className="bg-[#1e6bb5] text-white text-center font-bold text-sm py-3 px-4 rounded-t-lg mb-0">
        MATRIZ DE IDENTIFICACIÓN DE PELIGROS/FACTORES DE RIESGO Y EVALUACIÓN DE RIESGOS
      </div>

      {/* ── Campos empresa ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-0 border border-t-0 border-slate-300 mb-4">
        <div className="border-r border-b border-slate-300 px-4 py-2 text-sm">
          <span className="font-semibold text-slate-700">Empresa: </span>
          <span className="text-slate-600">{empresa.razon_social}</span>
        </div>
        <div className="border-b border-slate-300 px-4 py-2 text-sm">
          <span className="font-semibold text-slate-700">Área: </span>
          <span className="text-slate-600">{centro?.nombre ?? '—'}</span>
        </div>
        <div className="border-r border-slate-300 px-4 py-2 text-sm">
          <span className="font-semibold text-slate-700">Sucursal: </span>
          <span className="text-slate-600">{empresa.comuna}</span>
        </div>
        <div className="px-4 py-2 text-sm">
          <span className="font-semibold text-slate-700">Responsable: </span>
          <span className="text-slate-600">{responsable}</span>
        </div>
      </div>

      {/* ── Resumen rápido (no imprime) ────────────────────────────────────── */}
      <div className="no-print grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Tolerables',   count: registros.filter(m => m.clasificacion_riesgo === 'tolerable').length,   cls: 'riesgo-tolerable' },
          { label: 'Moderados',    count: registros.filter(m => m.clasificacion_riesgo === 'moderado').length,    cls: 'riesgo-moderado' },
          { label: 'Importantes',  count: registros.filter(m => m.clasificacion_riesgo === 'importante').length,  cls: 'riesgo-importante' },
          { label: 'Intolerables', count: registros.filter(m => m.clasificacion_riesgo === 'intolerable').length, cls: 'riesgo-intolerable' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`${cls} px-3 py-2 rounded-lg text-center`}>
            <div className="text-xl font-bold">{count}</div>
            <div className="text-[11px] font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {registros.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Sin registros MIPER</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1e3a5f]/30">
          <table className="w-full border-collapse text-[10px]" style={{ minWidth: '1300px' }}>

            {/* ══ ENCABEZADO TRIPLE ══════════════════════════════════════════ */}
            <thead>
              {/* ── Fila 1: grupos principales ─────────────────────────────── */}
              <tr className="bg-[#1e3a5f]">
                <TH3 cls="align-middle" children={<span>PROCESO<br/><span className="font-normal text-white/60">*</span></span>} />
                <TH3 cls="align-middle" children={<span>Puestos de<br/>trabajo<span className="font-normal text-white/60">*</span></span>} />
                <TH3 cls="align-middle" children={<span>Tareas<span className="font-normal text-white/60">*</span></span>} />
                <TH3 cls="align-middle max-w-[130px]" children={<span>IDENTIFICACIÓN<br/>DE PELIGROS<span className="font-normal text-white/60">**</span></span>} />
                <TH3 cls="align-middle max-w-[100px]" children={<span>FACTORES<br/>DE RIESGOS<span className="font-normal text-white/60">**</span></span>} />
                <TH3 cls="align-middle" children={<span>RIESGO<span className="font-normal text-white/60">***</span></span>} />
                {/* EVALUACIÓN DE RIESGOS */}
                <th colSpan={10} className="border border-[#1e3a5f]/40 px-2 py-2 text-center text-[10px] font-bold text-white bg-[#1e6bb5]">
                  EVALUACIÓN DE RIESGOS
                </th>
                <TH3 cls="align-middle" children="Medidas Preventivas" />
              </tr>

              {/* ── Fila 2: subcategorías evaluación ───────────────────────── */}
              <tr>
                {/* Las primeras 6 columnas tienen rowSpan en fila 1 — celdas vacías aquí */}
                <td colSpan={6} className="bg-[#1e3a5f]" />

                {/* De Seguridad y Emergencias */}
                <th colSpan={4} className="border border-[#b8860b]/40 px-2 py-1.5 text-center text-[9px] font-bold text-[#7a5c00] bg-[#ffd966]">
                  De Seguridad y Emergencias
                </th>
                {/* Higiénicos */}
                <th colSpan={2} className="border border-[#b8860b]/40 px-2 py-1.5 text-center text-[9px] font-bold text-[#7a5c00] bg-[#ffd966]">
                  Higiénicos
                </th>
                {/* Psicosociales */}
                <th colSpan={2} className="border border-[#b8860b]/40 px-2 py-1.5 text-center text-[9px] font-bold text-[#7a5c00] bg-[#ffd966]">
                  Psicosociales
                </th>
                {/* Musculo Esquelético */}
                <th colSpan={2} className="border border-[#b8860b]/40 px-2 py-1.5 text-center text-[9px] font-bold text-[#7a5c00] bg-[#ffd966]">
                  Músculo Esquelético
                </th>

                <td className="bg-[#1e3a5f]" />
              </tr>

              {/* ── Fila 3: columnas individuales ──────────────────────────── */}
              <tr>
                <td colSpan={6} className="bg-[#1e3a5f]" />

                {/* De Seguridad y Emergencias → 4 columnas */}
                <TH3Y children={<span>Probabilidad<br/>(P)</span>} />
                <TH3Y children={<span>Consecuencia<br/>(S)</span>} />
                <TH3Y children="VEP" />
                <TH3Y children={<span>NIVEL DE<br/>RIESGO<span className="font-normal">****</span></span>} />

                {/* Higiénicos → 2 columnas */}
                <TH3Y children={<span>Magnitud de la<br/>exposición</span>} />
                <TH3Y children={<span>NIVEL DE<br/>RIESGO<span className="font-normal">****</span></span>} />

                {/* Psicosociales → 2 columnas */}
                <TH3Y children={<span>Magnitud de la<br/>exposición</span>} />
                <TH3Y children={<span>NIVEL DE<br/>RIESGO<span className="font-normal">****</span></span>} />

                {/* Musculo Esquelético → 2 columnas */}
                <TH3Y children={<span>Magnitud de la<br/>exposición</span>} />
                <TH3Y children={<span>NIVEL DE<br/>RIESGO<span className="font-normal">****</span></span>} />

                <td className="bg-[#1e3a5f]" />
              </tr>
            </thead>

            {/* ══ CUERPO ═══════════════════════════════════════════════════════ */}
            <tbody>
              {registros.map((m, i) => {
                const tarea   = tareas.find(t => t.id === m.tarea_id)
                const proceso = procesos.find(p => p.id === tarea?.proceso_id)
                const p = pNum(m.probabilidad)
                const s = sNum(m.consecuencia)
                const vep = m.mr
                const nivelCls = riesgoClass[m.clasificacion_riesgo] ?? ''
                const nivelTxt = riesgoLabel[m.clasificacion_riesgo] ?? m.clasificacion_riesgo

                // Categoría de evaluación según código Anexo N°3
                const factor  = m.factor_riesgo ?? ''
                const categ   = categoriaEvaluacion(factor)
                const esSeg   = categ === 'seguridad'
                const esHig   = categ === 'higienico'
                const esPsi   = categ === 'psicosocial'
                const esMusc  = categ === 'musculo'
                // Etiqueta del catálogo (con fallback para valores legados)
                const factorLabel = LABEL_CATALOGO_RIESGO[factor] ?? factor.replace(/_/g, ' ')

                const TD = ({ children, cls = '' }: { children: React.ReactNode; cls?: string }) => (
                  <td className={`border border-slate-200 px-2 py-2.5 align-top ${cls}`}>{children}</td>
                )

                return (
                  <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    {/* PROCESO */}
                    <TD cls="font-medium text-slate-800 max-w-[110px]">
                      {proceso?.nombre ?? '—'}
                    </TD>
                    {/* Puestos de trabajo */}
                    <TD cls="text-slate-600 max-w-[100px]">
                      {tarea?.puesto_trabajo ?? '—'}
                    </TD>
                    {/* Tareas */}
                    <TD cls="text-slate-600 max-w-[120px]">
                      {tarea?.actividad ?? '—'}
                    </TD>
                    {/* Identificación peligros */}
                    <TD cls="max-w-[130px]">
                      <div className="font-medium text-slate-800">{m.peligro}</div>
                      {m.dano_probable && (
                        <div className="text-[9px] text-slate-400 mt-0.5">{m.dano_probable}</div>
                      )}
                    </TD>
                    {/* Factores de Riesgos */}
                    <TD cls="max-w-[100px]">
                      {factor ? (
                        <div>
                          <span className="font-bold text-[#1e3a5f] text-[10px]">{factor}</span>
                          {factorLabel && (
                            <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                              {factorLabel.replace(/^[A-Z0-9]+ — /, '')}
                            </div>
                          )}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </TD>
                    {/* Riesgo */}
                    <TD cls="text-slate-600 max-w-[120px]">{m.riesgo}</TD>

                    {/* ── De Seguridad y Emergencias ── */}
                    <TD cls="text-center font-bold">{esSeg ? p : ''}</TD>
                    <TD cls="text-center font-bold">{esSeg ? s : ''}</TD>
                    <TD cls="text-center font-bold">
                      {esSeg ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${nivelCls}`}>{vep}</span>
                      ) : ''}
                    </TD>
                    <TD cls="text-center">
                      {esSeg ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${nivelCls}`}>
                          {nivelTxt}
                        </span>
                      ) : ''}
                    </TD>

                    {/* ── Higiénicos ── */}
                    <TD cls="text-center font-bold">{esHig ? vep : <span className="text-slate-200">—</span>}</TD>
                    <TD cls="text-center">
                      {esHig ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${nivelCls}`}>
                          {nivelTxt}
                        </span>
                      ) : ''}</TD>

                    {/* ── Psicosociales ── */}
                    <TD cls="text-center font-bold">{esPsi ? vep : ''}</TD>
                    <TD cls="text-center">
                      {esPsi ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${nivelCls}`}>
                          {nivelTxt}
                        </span>
                      ) : ''}
                    </TD>

                    {/* ── Musculo Esquelético ── */}
                    <TD cls="text-center font-bold">{esMusc ? vep : ''}</TD>
                    <TD cls="text-center">
                      {esMusc ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${nivelCls}`}>
                          {nivelTxt}
                        </span>
                      ) : ''}
                    </TD>

                    {/* Medidas Preventivas */}
                    <TD cls="max-w-[160px]">
                      {m.medida_control && (
                        <div className="text-slate-700">{m.medida_control}</div>
                      )}
                      {m.tipo_control && (
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {LABEL_CONTROL[m.tipo_control]}
                        </div>
                      )}
                    </TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Notas al pie (formato oficial Anexo N°6) ───────────────────────── */}
      <div className="mt-3 grid grid-cols-2 gap-4 text-[9px] text-slate-500 border-t border-slate-100 pt-2">
        <div className="space-y-0.5">
          <p>* = Información recopilada de la etapa levantamiento de procesos (Anexo N°2)</p>
          <p>** = Obtenidos según aplicación ítem 6.2 de la Guía (catálogo Anexo N°3)</p>
        </div>
        <div className="space-y-0.5">
          <p>*** = Obtenido del listado del Anexo N°3 de la Guía</p>
          <p>**** = Obtenido de la aplicación del ítem 6.3 de la Guía · Higiénicos/Psicosociales/ME: resultado de protocolo MINSAL vigente</p>
        </div>
      </div>

      {/* ── Firmas oficiales 3 columnas ────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-3 gap-0 border border-slate-300 rounded text-sm">
        {[
          { label: 'Elaborado por:', fecha: true },
          { label: 'Revisado por:', fecha: true },
          { label: 'Aprobado por:', fecha: true },
        ].map((f, i) => (
          <div key={i} className={`px-4 py-4 ${i < 2 ? 'border-r border-slate-300' : ''}`}>
            <p className="font-semibold text-slate-700 text-xs">{f.label}</p>
            <div className="h-10 border-b border-slate-400 mt-4 mb-2" />
            <p className="text-xs font-semibold text-slate-700">Fecha:</p>
            <div className="h-6 border-b border-slate-300 mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// INFORME 3: PROGRAMA DE TRABAJO
// ══════════════════════════════════════════════════════════════════════════════

function InformePrograma() {
  const { empresa, centro, procesos, tareas, miperRegistros, programaTrabajo } = useAppStore()
  const fecha = fmtHoy()

  if (!empresa) return <SinDatos />

  const totalMedidas = programaTrabajo.length
  const completadas  = programaTrabajo.filter(p => p.estado === 'completado').length
  const avance       = totalMedidas > 0 ? Math.round((completadas / totalMedidas) * 100) : 0

  return (
    <div className="report-doc">
      <ReportHeader
        titulo="PROGRAMA DE TRABAJO PREVENTIVO"
        subtitulo="Seguimiento de Medidas de Control — Módulo 3"
        empresa={empresa}
        centro={centro}
        fecha={fecha}
      />

      {/* KPIs de avance */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <div className="sm:col-span-1 bg-[#1e3a5f] text-white rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold">{avance}%</div>
          <div className="text-[11px] text-white/70">Avance General</div>
        </div>
        {[
          { key: 'pendiente',   label: 'Pendientes',  cls: 'bg-slate-100 text-slate-700' },
          { key: 'en_proceso',  label: 'En Proceso',  cls: 'bg-blue-100 text-blue-700'  },
          { key: 'completado',  label: 'Completados', cls: 'bg-green-100 text-green-700' },
          { key: 'vencido',     label: 'Vencidos',    cls: 'bg-red-100 text-red-700'    },
        ].map(({ key, label, cls }) => (
          <div key={key} className={`${cls} rounded-lg px-4 py-3 text-center`}>
            <div className="text-2xl font-bold">
              {programaTrabajo.filter(p => p.estado === key).length}
            </div>
            <div className="text-[11px] font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {programaTrabajo.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Sin medidas en el programa de trabajo</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[11px]" style={{ minWidth: '820px' }}>
            <thead className="bg-[#1e3a5f]">
              <tr>
                {['N°', 'Proceso', 'Medida de Control',
                  'Responsable', 'F. Programada', 'F. Efectiva',
                  'Avance', 'Estado'].map(h => (
                  <th key={h} className="table-th text-[10px] whitespace-nowrap py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programaTrabajo.map(pt => {
                const miper   = miperRegistros.find(m => m.id === pt.miper_id)
                const tarea   = tareas.find(t => t.id === miper?.tarea_id)
                const proceso = procesos.find(p => p.id === tarea?.proceso_id)
                return (
                  <tr key={pt.id} className="hover:bg-slate-50">
                    <td className="table-td text-center text-slate-400 font-semibold">{pt.numero_programa}</td>
                    <td className="table-td font-medium text-slate-700 max-w-[160px]">
                      {proceso?.nombre ?? pt.proceso_nombre ?? '—'}
                    </td>
                    <td className="table-td max-w-[220px] text-slate-600">
                      {pt.actividad_medida_control}
                    </td>
                    <td className="table-td whitespace-nowrap">{pt.responsable}</td>
                    <td className="table-td whitespace-nowrap text-slate-500">{fmtFecha(pt.fecha_ejecucion_programada)}</td>
                    <td className="table-td whitespace-nowrap text-slate-500">{fmtFecha(pt.fecha_ejecucion_efectiva)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[50px]">
                          <div
                            className="h-full bg-[#1e3a5f] rounded-full"
                            style={{ width: `${pt.porcentaje_avance}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-600 shrink-0">
                          {pt.porcentaje_avance}%
                        </span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        COLOR_ESTADO[pt.estado as EstadoPrograma] ?? ''
                      }`}>
                        {LABEL_ESTADO[pt.estado as EstadoPrograma] ?? pt.estado}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <FirmaArea firmantes={['Prevencionista de Riesgos', 'Representante de la Empresa', 'Comité Paritario']} />
    </div>
  )
}

// ─── Sin datos ────────────────────────────────────────────────────────────────

function SinDatos() {
  return (
    <div className="text-center py-16 text-slate-400">
      <div className="text-4xl mb-3">📋</div>
      <p className="text-sm font-medium">Sin datos disponibles</p>
      <p className="text-xs mt-1">Completa el Levantamiento de Procesos primero</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function InformesPage() {
  const [activo, setActivo] = useState<Reporte>('levantamiento')
  const { empresa, centro, procesos, tareas, miperRegistros, programaTrabajo } = useAppStore()

  const handlePrint = () => window.print()

  const handleExcel = () => {
    if (activo === 'levantamiento') {
      exportLevantamientoExcel(empresa, centro, procesos, tareas)
    } else if (activo === 'miper') {
      exportMiperExcel(empresa, centro, procesos, tareas, miperRegistros)
    } else {
      exportProgramaExcel(empresa, centro, procesos, tareas, miperRegistros, programaTrabajo)
    }
  }

  const tabs: { key: Reporte; icon: string; label: string }[] = [
    { key: 'levantamiento', icon: '📋', label: 'Levantamiento' },
    { key: 'miper',         icon: '⚠️',  label: 'MIPER'        },
    { key: 'programa',      icon: '📅', label: 'Programa'      },
  ]

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">

      {/* ── Barra de acciones (no se imprime) ───────────────────────────────── */}
      <div className="no-print">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Informes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Genera e imprime informes oficiales · DS 44 · Ley 16.744
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Tabs */}
          <div className="flex gap-2 flex-1 flex-wrap">
            {tabs.map(t => (
              <TabBtn
                key={t.key}
                icon={t.icon}
                label={t.label}
                activo={activo === t.key}
                onClick={() => setActivo(t.key)}
              />
            ))}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            {/* Exportar Excel */}
            <button
              onClick={handleExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm active:scale-95"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Imprimir / PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-medium rounded-lg transition-colors shadow-sm active:scale-95"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Tip para móvil */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4 text-xs text-blue-700">
          <span className="shrink-0 mt-0.5">💡</span>
          <span>
            <strong>iPhone / iPad:</strong> toca "Imprimir / PDF" → aparece el diálogo de impresión de iOS.
            Puedes imprimir en AirPrint o tocar <em>Opciones</em> → <em>Guardar como PDF</em> para exportar.
          </span>
        </div>
      </div>

      {/* ── Documento del informe ─────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 print:shadow-none print:border-0 print:p-0 print:rounded-none"
        id="informe-imprimible"
      >
        {activo === 'levantamiento' && <InformeLevantamiento />}
        {activo === 'miper'         && <InformeMiper />}
        {activo === 'programa'      && <InformePrograma />}
      </div>

    </div>
  )
}
