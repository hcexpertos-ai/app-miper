// ══════════════════════════════════════════════════════════════════════════════
// APP MIPER · Exportación a Excel con estilos (xlsx-js-style)
// Tres workbooks independientes: Levantamiento, MIPER, Programa de Trabajo
// ══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require('xlsx-js-style')

import type { Empresa, CentroTrabajo, Proceso, Tarea, MiperRegistro, ProgramaTrabajo } from '../../types'
import { LABEL_TIPO_PROCESO, LABEL_PROBABILIDAD, LABEL_CONSECUENCIA, LABEL_CONTROL, LABEL_ESTADO, LABEL_CATALOGO_RIESGO } from '../../types'

const fmtFecha = (iso: string) => iso ? new Date(iso).toLocaleDateString('es-CL') : ''
const hoy = () => new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Paleta de colores ────────────────────────────────────────────────────────

const C = {
  headerBg:     '1E3A5F',
  headerBg2:    '2D5180',
  headerFg:     'FFFFFF',
  altRowBg:     'F0F4F8',
  yellowBg:     'FFD966',
  yellowFg:     '7A5C00',
  tolerableBg:  'DCFCE7', tolerableFg:  '166534',
  moderadoBg:   'FEF9C3', moderadoFg:   '854D0E',
  importanteBg: 'FFEDD5', importanteFg: '9A3412',
  intolerableBg:'FEE2E2', intolerableFg:'991B1B',
  pendienteBg:  'F1F5F9', pendienteFg:  '334155',
  enProcesoBg:  'DBEAFE', enProcesoFg:  '1D4ED8',
  completadoBg: 'DCFCE7', completadoFg: '15803D',
  vencidoBg:    'FEE2E2', vencidoFg:    'B91C1C',
}

// ─── Helpers de estilo ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CStyle = Record<string, any>

function border(): CStyle {
  const t = { style: 'thin', color: { rgb: 'CBD5E1' } }
  return { top: t, bottom: t, left: t, right: t }
}

function sHeader(bg = C.headerBg, fg = C.headerFg, sz = 9): CStyle {
  return {
    font:      { bold: true, color: { rgb: fg }, name: 'Arial', sz },
    fill:      { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border:    border(),
  }
}

function sData(alt = false, wrap = false, bold = false): CStyle {
  return {
    font:      { name: 'Arial', sz: 9, bold },
    fill:      { fgColor: { rgb: alt ? C.altRowBg : 'FFFFFF' }, patternType: 'solid' },
    alignment: { vertical: 'top', wrapText: wrap },
    border:    border(),
  }
}

function sCenter(alt = false, bold = false): CStyle {
  return { ...sData(alt, false, bold), alignment: { horizontal: 'center', vertical: 'top' } }
}

function sRiesgo(clasificacion: string): CStyle {
  const map: Record<string, [string, string]> = {
    tolerable:   [C.tolerableBg,   C.tolerableFg],
    moderado:    [C.moderadoBg,    C.moderadoFg],
    importante:  [C.importanteBg,  C.importanteFg],
    intolerable: [C.intolerableBg, C.intolerableFg],
  }
  const [bg, fg] = map[clasificacion?.toLowerCase()] ?? ['FFFFFF', '000000']
  return {
    font:      { bold: true, name: 'Arial', sz: 9, color: { rgb: fg } },
    fill:      { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'top' },
    border:    border(),
  }
}

function sEstado(estado: string): CStyle {
  const map: Record<string, [string, string]> = {
    pendiente:  [C.pendienteBg,  C.pendienteFg],
    en_proceso: [C.enProcesoBg,  C.enProcesoFg],
    completado: [C.completadoBg, C.completadoFg],
    vencido:    [C.vencidoBg,    C.vencidoFg],
  }
  const [bg, fg] = map[estado] ?? ['FFFFFF', '000000']
  return {
    font:      { bold: true, name: 'Arial', sz: 9, color: { rgb: fg } },
    fill:      { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'top' },
    border:    border(),
  }
}

/** Aplica estilo a todos los cells en el rango */
function styleRow(
  ws: Record<string, unknown>,
  row: number,
  colStart: number,
  colEnd: number,
  style: CStyle,
) {
  for (let c = colStart; c <= colEnd; c++) {
    const addr = XLSX.utils.encode_cell({ r: row, c })
    if (!(ws as Record<string, {v:unknown;t:string;s?:CStyle}>)[addr]) {
      (ws as Record<string, {v:unknown;t:string;s?:CStyle}>)[addr] = { v: '', t: 's' }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(ws as any)[addr].s = style
  }
}

function setCellStyle(ws: Record<string, unknown>, row: number, col: number, style: CStyle) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((ws as any)[addr]) (ws as any)[addr].s = style
}

// ─── 1. INFORME DE LEVANTAMIENTO ──────────────────────────────────────────────

export function exportLevantamientoExcel(
  empresa: Empresa | null,
  centro:  CentroTrabajo | null,
  procesos: Proceso[],
  tareas:   Tarea[],
) {
  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Datos generales ────────────────────────────────────────────────
  const infoRows = [
    ['INFORME DE LEVANTAMIENTO DE PROCESOS — DS 44'],
    ['Fecha de generación:', hoy()],
    [],
    ['EMPRESA'],
    ['Razón Social:', empresa?.razon_social ?? '—'],
    ['RUT:', empresa?.rut ?? '—'],
    ['Actividad Económica:', empresa?.actividad_economica ?? '—'],
    ['Comuna:', empresa?.comuna ?? '—'],
    [],
    ['CENTRO DE TRABAJO'],
    ['Nombre:', centro?.nombre ?? '—'],
    ['Dirección:', centro?.direccion ?? '—'],
    ['N° Trabajadores (H):', centro?.n_trabajadores_hombres ?? 0],
    ['N° Trabajadores (M):', centro?.n_trabajadores_mujeres ?? 0],
    ['N° Trabajadores (Otro):', centro?.n_trabajadores_otro ?? 0],
    ['Total Trabajadores:', (centro?.n_trabajadores_hombres ?? 0) + (centro?.n_trabajadores_mujeres ?? 0) + (centro?.n_trabajadores_otro ?? 0)],
    [],
    ['PROCESOS'],
    ['N°', 'Nombre Proceso', 'Tipo', 'Responsable', 'Fecha Levantamiento'],
    ...procesos.map((p, i) => [i + 1, p.nombre, LABEL_TIPO_PROCESO[p.tipo], p.responsable_levantamiento, fmtFecha(p.fecha_levantamiento)]),
  ]
  const wsInfo = XLSX.utils.aoa_to_sheet(infoRows)
  wsInfo['!cols'] = [{ wch: 30 }, { wch: 50 }, { wch: 20 }, { wch: 30 }, { wch: 18 }]
  // Título
  setCellStyle(wsInfo, 0, 0, sHeader(C.headerBg, C.headerFg, 12))
  // Sub-títulos de sección
  ;[3, 9, 17].forEach(r => setCellStyle(wsInfo, r, 0, sHeader(C.headerBg2, C.headerFg, 9)))
  // Encabezado de procesos
  for (let c = 0; c < 5; c++) setCellStyle(wsInfo, 18, c, sHeader())
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Datos Generales')

  // ── Hoja 2: Levantamiento DS44 ─────────────────────────────────────────────
  const filas: (string | number)[][] = []
  procesos.forEach(proceso => {
    tareas.filter(t => t.proceso_id === proceso.id).forEach(t => {
      const obs = (t.observaciones && t.observaciones.trim())
        ? t.observaciones
        : [t.equipos_involucrados, t.materiales_sustancias].filter(Boolean).join(' · ')
      filas.push([
        proceso.nombre,
        LABEL_TIPO_PROCESO[proceso.tipo],
        t.puesto_trabajo,
        t.actividad + (t.descripcion_tarea ? '\n' + t.descripcion_tarea : ''),
        t.es_rutinaria ? 'Rutinaria' : 'No Rutinaria',
        t.lugar_ejecucion,
        t.n_trabajadores_hombres,
        t.n_trabajadores_mujeres,
        t.n_trabajadores_otro,
        obs,
      ])
    })
  })

  const headerRow1 = [
    'Proceso', 'Tipo de Proceso', 'Puesto de Trabajo', 'Tarea',
    'Rutinaria / No Rutinaria', 'Lugar de Ejecución',
    'N° Trabajadores Expuestos / Identidad Sexogenérica', '', '',
    'Observaciones',
  ]
  const headerRow2 = ['', '', '', '', '', '', 'H', 'M', 'Otro', '']
  const allRows: (string | number)[][] = [headerRow1, headerRow2, ...filas]
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  ws['!merges'] = [
    { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
    { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },
  ]
  ws['!cols'] = [
    { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 32 },
    { wch: 18 }, { wch: 22 }, { wch: 6 }, { wch: 6 }, { wch: 8 }, { wch: 35 },
  ]
  ws['!freeze'] = { xSplit: 0, ySplit: 2 }

  // Estilos encabezado fila 1
  styleRow(ws, 0, 0, 9, sHeader())
  // Fila 2: sub-encabezado H/M/Otro con colores
  styleRow(ws, 1, 0, 5, sHeader())
  setCellStyle(ws, 1, 6, sHeader(C.headerBg2, 'BFD9FF'))  // H – azul claro
  setCellStyle(ws, 1, 7, sHeader(C.headerBg2, 'FFB3C6'))  // M – rosa
  setCellStyle(ws, 1, 8, sHeader(C.headerBg2, 'D8B4FE'))  // Otro – violeta
  setCellStyle(ws, 1, 9, sHeader())

  // Estilos filas de datos
  for (let r = 2; r < allRows.length; r++) {
    const alt = (r - 2) % 2 === 1
    for (let c = 0; c < 10; c++) {
      const wrap = c === 3 || c === 9
      setCellStyle(ws, r, c, sData(alt, wrap))
    }
    // H/M/Otro centrado y con color suave
    setCellStyle(ws, r, 6, { ...sCenter(alt, true), font: { bold: true, sz: 9, color: { rgb: '1D4ED8' }, name: 'Arial' } })
    setCellStyle(ws, r, 7, { ...sCenter(alt, true), font: { bold: true, sz: 9, color: { rgb: 'BE185D' }, name: 'Arial' } })
    setCellStyle(ws, r, 8, { ...sCenter(alt, true), font: { bold: true, sz: 9, color: { rgb: '7E22CE' }, name: 'Arial' } })
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Levantamiento DS44')
  XLSX.writeFile(wb, `Levantamiento_${empresa?.rut ?? 'empresa'}_${hoy().replace(/\//g, '-')}.xlsx`)
}

// ─── 2. INFORME MIPER ─────────────────────────────────────────────────────────

export function exportMiperExcel(
  empresa:        Empresa | null,
  centro:         CentroTrabajo | null,
  procesos:       Proceso[],
  tareas:         Tarea[],
  miperRegistros: MiperRegistro[],
) {
  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Portada ────────────────────────────────────────────────────────
  const portada = [
    ['MATRIZ DE IDENTIFICACIÓN DE PELIGROS Y EVALUACIÓN DE RIESGOS (MIPER)'],
    ['Fecha:', hoy()],
    ['Empresa:', empresa?.razon_social ?? '—'],
    ['RUT:', empresa?.rut ?? '—'],
    ['Centro de Trabajo:', centro?.nombre ?? '—'],
    [],
    ['RESUMEN'],
    ['Total Riesgos:', miperRegistros.length],
    ['Tolerables:', miperRegistros.filter(m => m.clasificacion_riesgo === 'tolerable').length],
    ['Moderados:', miperRegistros.filter(m => m.clasificacion_riesgo === 'moderado').length],
    ['Importantes:', miperRegistros.filter(m => m.clasificacion_riesgo === 'importante').length],
    ['Intolerables:', miperRegistros.filter(m => m.clasificacion_riesgo === 'intolerable').length],
    ['Controlados:', miperRegistros.filter(m => m.esta_controlado).length],
  ]
  const wsPortada = XLSX.utils.aoa_to_sheet(portada)
  wsPortada['!cols'] = [{ wch: 25 }, { wch: 50 }]
  setCellStyle(wsPortada, 0, 0, sHeader(C.headerBg, C.headerFg, 12))
  setCellStyle(wsPortada, 6, 0, sHeader(C.headerBg2, C.headerFg, 9))
  // Colores en resumen
  const resumenColors: [number, string][] = [
    [8, 'tolerable'], [9, 'moderado'], [10, 'importante'], [11, 'intolerable'],
  ]
  resumenColors.forEach(([r, cls]) => {
    setCellStyle(wsPortada, r, 0, sData(false))
    setCellStyle(wsPortada, r, 1, sRiesgo(cls))
  })
  XLSX.utils.book_append_sheet(wb, wsPortada, 'Portada')

  // ── Hoja 2: Matriz MIPER ──────────────────────────────────────────────────
  const miperHeaders = [
    'N°', 'Proceso', 'Actividad / Tarea', 'Puesto Trabajo',
    'Factor de Riesgo', 'Peligro', 'Riesgo', 'Daño Probable',
    'Probabilidad', 'Consecuencia (S)', 'VEP', 'Clasificación',
    'Jerarquía Control', 'Medida de Control',
    'Responsable Control', 'Plazo', 'Controlado', 'Fecha Elaboración',
  ]
  const miperRows: (string | number)[][] = [miperHeaders]

  miperRegistros.forEach((m, i) => {
    const tarea   = tareas.find(t => t.id === m.tarea_id)
    const proceso = procesos.find(p => p.id === tarea?.proceso_id)
    const factorLabel = m.factor_riesgo
      ? (LABEL_CATALOGO_RIESGO[m.factor_riesgo] ?? m.factor_riesgo)
      : '—'
    miperRows.push([
      i + 1,
      proceso?.nombre ?? '—',
      tarea?.actividad ?? '—',
      tarea?.puesto_trabajo ?? '—',
      factorLabel,
      m.peligro,
      m.riesgo,
      m.dano_probable,
      LABEL_PROBABILIDAD[m.probabilidad] ?? m.probabilidad,
      LABEL_CONSECUENCIA[m.consecuencia] ?? m.consecuencia,
      m.mr,
      m.clasificacion_riesgo.toUpperCase(),
      m.tipo_control ? LABEL_CONTROL[m.tipo_control] : '—',
      m.medida_control,
      m.responsable_control,
      fmtFecha(m.plazo_control),
      m.esta_controlado ? 'Sí' : 'No',
      fmtFecha(m.fecha_elaboracion),
    ])
  })

  const wsMiper = XLSX.utils.aoa_to_sheet(miperRows)
  const nCols = miperHeaders.length

  // Anchos de columna
  wsMiper['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 22 }, { wch: 16 },
    { wch: 28 }, { wch: 24 }, { wch: 24 }, { wch: 20 },
    { wch: 14 }, { wch: 22 }, { wch: 6 }, { wch: 14 },
    { wch: 18 }, { wch: 28 }, { wch: 18 }, { wch: 12 },
    { wch: 10 }, { wch: 14 },
  ]
  wsMiper['!freeze'] = { xSplit: 0, ySplit: 1 }

  // Encabezado
  styleRow(wsMiper, 0, 0, nCols - 1, sHeader())

  // Filas de datos
  miperRegistros.forEach((m, i) => {
    const row = i + 1
    const alt = i % 2 === 1
    for (let c = 0; c < nCols; c++) {
      const isClasif = c === 11  // columna "Clasificación"
      const isVEP    = c === 10  // columna VEP
      if (isClasif) {
        setCellStyle(wsMiper, row, c, sRiesgo(m.clasificacion_riesgo))
      } else if (isVEP) {
        setCellStyle(wsMiper, row, c, { ...sCenter(alt, true), ...sRiesgo(m.clasificacion_riesgo) })
      } else {
        setCellStyle(wsMiper, row, c, sData(alt, c === 13))  // wrap en Medida Control
      }
    }
  })

  XLSX.utils.book_append_sheet(wb, wsMiper, 'Matriz MIPER')
  XLSX.writeFile(wb, `MIPER_${empresa?.rut ?? 'empresa'}_${hoy().replace(/\//g, '-')}.xlsx`)
}

// ─── 3. INFORME PROGRAMA DE TRABAJO ──────────────────────────────────────────

export function exportProgramaExcel(
  empresa:        Empresa | null,
  centro:         CentroTrabajo | null,
  procesos:       Proceso[],
  tareas:         Tarea[],
  miperRegistros: MiperRegistro[],
  programaTrabajo: ProgramaTrabajo[],
) {
  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Resumen ────────────────────────────────────────────────────────
  const resumen = [
    ['PROGRAMA DE TRABAJO PREVENTIVO'],
    ['Fecha:', hoy()],
    ['Empresa:', empresa?.razon_social ?? '—'],
    ['RUT:', empresa?.rut ?? '—'],
    ['Centro de Trabajo:', centro?.nombre ?? '—'],
    [],
    ['ESTADO DE AVANCE'],
    ['Total Medidas:', programaTrabajo.length],
    ['Pendientes:', programaTrabajo.filter(p => p.estado === 'pendiente').length],
    ['En Proceso:', programaTrabajo.filter(p => p.estado === 'en_proceso').length],
    ['Completadas:', programaTrabajo.filter(p => p.estado === 'completado').length],
    ['Vencidas:', programaTrabajo.filter(p => p.estado === 'vencido').length],
  ]
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen)
  wsResumen['!cols'] = [{ wch: 25 }, { wch: 50 }]
  setCellStyle(wsResumen, 0, 0, sHeader(C.headerBg, C.headerFg, 12))
  setCellStyle(wsResumen, 6, 0, sHeader(C.headerBg2, C.headerFg, 9))
  ;[
    [8, 'pendiente'], [9, 'en_proceso'], [10, 'completado'], [11, 'vencido'],
  ].forEach(([r, est]) => setCellStyle(wsResumen, r as number, 1, sEstado(est as string)))
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // ── Hoja 2: Programa completo ──────────────────────────────────────────────
  // Columnas: N° | Proceso | Medida de Control | Responsable | F.Programada | F.Efectiva | Avance% | Estado
  const progHeaders = [
    'N° Programa', 'Proceso', 'Medida de Control',
    'Responsable', 'Fecha Programada', 'Fecha Efectiva',
    'Avance %', 'Estado',
  ]
  const progRows: (string | number)[][] = [progHeaders]

  programaTrabajo.forEach(pt => {
    const miper   = miperRegistros.find(m => m.id === pt.miper_id)
    const tarea   = tareas.find(t => t.id === miper?.tarea_id)
    const proceso = procesos.find(p => p.id === tarea?.proceso_id)
    progRows.push([
      pt.numero_programa,
      proceso?.nombre ?? pt.proceso_nombre ?? '—',
      pt.actividad_medida_control,
      pt.responsable,
      fmtFecha(pt.fecha_ejecucion_programada),
      fmtFecha(pt.fecha_ejecucion_efectiva),
      pt.porcentaje_avance,
      LABEL_ESTADO[pt.estado] ?? pt.estado,
    ])
  })

  const wsProg = XLSX.utils.aoa_to_sheet(progRows)
  const nCols  = progHeaders.length

  wsProg['!cols'] = [
    { wch: 12 }, { wch: 24 }, { wch: 36 },
    { wch: 20 }, { wch: 16 }, { wch: 16 },
    { wch: 10 }, { wch: 14 },
  ]
  wsProg['!freeze'] = { xSplit: 0, ySplit: 1 }

  // Encabezado
  styleRow(wsProg, 0, 0, nCols - 1, sHeader())

  // Filas de datos
  programaTrabajo.forEach((pt, i) => {
    const row = i + 1
    const alt = i % 2 === 1
    for (let c = 0; c < nCols; c++) {
      if (c === 7) {
        // Estado con color
        setCellStyle(wsProg, row, c, sEstado(pt.estado))
      } else if (c === 6) {
        // Avance % centrado
        const pct = pt.porcentaje_avance
        const bg  = pct >= 100 ? C.completadoBg : pct >= 50 ? 'DBEAFE' : alt ? C.altRowBg : 'FFFFFF'
        const fg  = pct >= 100 ? C.completadoFg : pct >= 50 ? C.enProcesoFg : '000000'
        setCellStyle(wsProg, row, c, {
          font:      { bold: true, name: 'Arial', sz: 9, color: { rgb: fg } },
          fill:      { fgColor: { rgb: bg }, patternType: 'solid' },
          alignment: { horizontal: 'center', vertical: 'top' },
          border:    border(),
        })
      } else {
        setCellStyle(wsProg, row, c, sData(alt, c === 2))  // wrap en Medida de Control
      }
    }
  })

  XLSX.utils.book_append_sheet(wb, wsProg, 'Programa de Trabajo')
  XLSX.writeFile(wb, `Programa_${empresa?.rut ?? 'empresa'}_${hoy().replace(/\//g, '-')}.xlsx`)
}
