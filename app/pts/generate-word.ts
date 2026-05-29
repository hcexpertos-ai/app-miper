// ─── Generador Word para PTS ──────────────────────────────────────────────────

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, BorderStyle, WidthType, ShadingType,
  Footer, PageNumber, VerticalAlign, Header,
} from 'docx'
import type { PtsRegistro, MiperRegistro, Tarea, Proceso, Empresa, CentroTrabajo } from '@/src/types'
import { LABEL_CONTROL } from '@/src/types'

const fmtFecha = (iso: string) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('es-CL') : '—'

const AZUL  = '1e3a5f'
const GRIS  = 'e2e8f0'
const WHITE = 'FFFFFF'
const W     = 9360 // ancho contenido (0.5" márgenes en A4)

const brd = { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' }
const borders = { top: brd, bottom: brd, left: brd, right: brd }
const pad = { top: 60, bottom: 60, left: 100, right: 100 }

function th(text: string, w: number, center = false): TableCell {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders,
    shading: { fill: AZUL, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER, margins: pad,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: 'Arial', size: 18, bold: true, color: WHITE })],
    })],
  })
}

function lbl(text: string, w = 2400): TableCell {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders,
    shading: { fill: GRIS, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER, margins: pad,
    children: [new Paragraph({ children: [new TextRun({ text, font: 'Arial', size: 18, bold: true, color: '475569' })] })],
  })
}

function val(text: string, w: number, span = 1, pre = false): TableCell {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, columnSpan: span, borders,
    verticalAlign: VerticalAlign.CENTER, margins: pad,
    children: pre
      ? text.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, font: 'Arial', size: 18 })] }))
      : [new Paragraph({ children: [new TextRun({ text: text || '—', font: 'Arial', size: 18 })] })],
  })
}

function secTitle(n: string, title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({ text: `${n}. `, font: 'Arial', size: 22, bold: true, color: AZUL }),
      new TextRun({ text: title.toUpperCase(), font: 'Arial', size: 22, bold: true }),
    ],
  })
}

export async function exportarPtsWord(
  pts: PtsRegistro,
  { tarea, proceso, empresa, centro, miperRows }: {
    tarea?:    Tarea
    proceso?:  Proceso
    empresa:   Empresa | null
    centro:    CentroTrabajo | null
    miperRows: MiperRegistro[]
  }
): Promise<void> {

  // Logo
  let logoBuffer: ArrayBuffer | null = null
  try { const r = await fetch('/logo.png'); logoBuffer = await r.arrayBuffer() } catch { /* sin logo */ }

  const logoCelda = new TableCell({
    width: { size: 2000, type: WidthType.DXA }, borders,
    shading: { fill: AZUL, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER, margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: logoBuffer
        ? [new ImageRun({ type: 'png', data: logoBuffer, transformation: { width: 110, height: 55 }, altText: { title: 'Logo', description: 'Logo PRSO', name: 'Logo' } })]
        : [new TextRun({ text: 'PRSO', font: 'Arial', size: 24, bold: true, color: WHITE })],
    })],
  })

  // ── Encabezado ──────────────────────────────────────────────────────────────
  const headerTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [2000, 5360, 2000],
    rows: [new TableRow({ children: [
      logoCelda,
      new TableCell({
        width: { size: 5360, type: WidthType.DXA }, borders,
        shading: { fill: AZUL, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER, margins: pad,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PROCEDIMIENTO DE TRABAJO SEGURO (PTS)', font: 'Arial', size: 20, bold: true, color: WHITE })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tarea?.actividad ?? '', font: 'Arial', size: 16, color: 'BDD7F0' })] }),
        ],
      }),
      new TableCell({
        width: { size: 2000, type: WidthType.DXA }, borders,
        shading: { fill: AZUL, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER, margins: pad,
        children: [
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Código: ${pts.codigo}`, font: 'Arial', size: 16, color: 'BDD7F0' })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Versión: ${pts.version}`, font: 'Arial', size: 16, color: 'BDD7F0' })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Fecha: ${fmtFecha(pts.fecha_elaboracion)}`, font: 'Arial', size: 16, color: 'BDD7F0' })] }),
        ],
      }),
    ] })],
  })

  // ── Empresa / Centro ─────────────────────────────────────────────────────────
  const half = Math.floor(W / 2)
  const empresaTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [half, W - half],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: half, type: WidthType.DXA }, borders,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'EMPRESA', font: 'Arial', size: 16, bold: true, color: '64748b' })] }),
          new Paragraph({ children: [new TextRun({ text: empresa?.razon_social ?? '—', font: 'Arial', size: 18, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `RUT: ${empresa?.rut ?? '—'}`, font: 'Arial', size: 16, color: '64748b' })] }),
        ],
      }),
      new TableCell({
        width: { size: W - half, type: WidthType.DXA }, borders,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'CENTRO DE TRABAJO', font: 'Arial', size: 16, bold: true, color: '64748b' })] }),
          new Paragraph({ children: [new TextRun({ text: centro?.nombre ?? '—', font: 'Arial', size: 18, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: centro?.direccion ?? '—', font: 'Arial', size: 16, color: '64748b' })] }),
        ],
      }),
    ] })],
  })

  // ── Objetivo / Alcance ───────────────────────────────────────────────────────
  const objTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [1600, W - 1600],
    rows: [
      new TableRow({ children: [lbl('1. OBJETIVO', 1600), val(pts.objetivo, W - 1600)] }),
      new TableRow({ children: [lbl('2. ALCANCE',  1600), val(pts.alcance,  W - 1600)] }),
    ],
  })

  // ── Responsabilidades ────────────────────────────────────────────────────────
  const cols3 = [2400, W - 2400]
  const respTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: cols3,
    rows: [
      new TableRow({ tableHeader: true, children: [th('Rol', cols3[0]), th('Responsabilidad', cols3[1])] }),
      ...([
        ['Gerencia / Administración', 'Proveer recursos e impulsar cumplimiento del marco regulatorio SST.'],
        ['Supervisor / Jefe de Terreno', 'Liderar la aplicación del PTS, verificar EPP y detener trabajos inseguros.'],
        ['Asesor en Prevención (HSE)', 'Asesoría técnica, inspecciones periódicas y validación normativa.'],
        ['Trabajadores / Ejecutantes', 'Cumplir la secuencia operativa, usar EPP y reportar condiciones subestándar.'],
      ] as [string, string][]).map(([rol, resp], i) => new TableRow({ children: [
        new TableCell({
          width: { size: cols3[0], type: WidthType.DXA }, borders,
          shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
          children: [new Paragraph({ children: [new TextRun({ text: rol, font: 'Arial', size: 18, bold: true })] })],
        }),
        new TableCell({
          width: { size: cols3[1], type: WidthType.DXA }, borders,
          shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
          children: [new Paragraph({ children: [new TextRun({ text: resp, font: 'Arial', size: 18 })] })],
        }),
      ] })),
    ],
  })

  // ── EPP ──────────────────────────────────────────────────────────────────────
  const eppRows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [th('Tipo de EPP', 2400), th('Elementos Requeridos', W - 2400)] }),
    new TableRow({ children: [lbl('EPP Básico (Obligatorio)', 2400), val(pts.epp_basico, W - 2400, 1, true)] }),
  ]
  if (pts.epp_especifico) {
    eppRows.push(new TableRow({ children: [lbl('EPP Específico (Tarea)', 2400), val(pts.epp_especifico, W - 2400, 1, true)] }))
  }
  if (tarea?.equipos_involucrados) {
    eppRows.push(new TableRow({ children: [lbl('Equipos / Herramientas', 2400), val(tarea.equipos_involucrados, W - 2400)] }))
  }
  const eppTable = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [2400, W - 2400], rows: eppRows })

  // ── Secuencia Operativa (desde MIPER) ────────────────────────────────────────
  const seqW = [360, 1800, 1800, 2400, 1400, 1600]
  const seqTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: seqW,
    rows: [
      new TableRow({ tableHeader: true, children: [
        th('N°', seqW[0], true), th('Peligro / Riesgo', seqW[1]),
        th('Daño Probable', seqW[2]), th('Medidas de Control', seqW[3]),
        th('Jerarquía', seqW[4], true), th('Nivel', seqW[5], true),
      ] }),
      ...(miperRows.length === 0
        ? [new TableRow({ children: [new TableCell({
            columnSpan: 6, width: { size: W, type: WidthType.DXA }, borders, margins: pad,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sin riesgos registrados en MIPER', font: 'Arial', size: 18, color: '94a3b8' })] })],
          })] })]
        : miperRows.map((m, i) => new TableRow({ children: [
            new TableCell({
              width: { size: seqW[0], type: WidthType.DXA }, borders,
              shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), font: 'Arial', size: 18, bold: true, color: '94a3b8' })] })],
            }),
            new TableCell({
              width: { size: seqW[1], type: WidthType.DXA }, borders,
              shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
              children: [
                new Paragraph({ children: [new TextRun({ text: m.peligro, font: 'Arial', size: 18, bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: m.riesgo, font: 'Arial', size: 16, color: '64748b' })] }),
              ],
            }),
            new TableCell({
              width: { size: seqW[2], type: WidthType.DXA }, borders,
              shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
              children: [new Paragraph({ children: [new TextRun({ text: m.dano_probable || '—', font: 'Arial', size: 18 })] })],
            }),
            new TableCell({
              width: { size: seqW[3], type: WidthType.DXA }, borders,
              shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
              children: [new Paragraph({ children: [new TextRun({ text: m.medida_control || '—', font: 'Arial', size: 18 })] })],
            }),
            new TableCell({
              width: { size: seqW[4], type: WidthType.DXA }, borders,
              shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.tipo_control ? LABEL_CONTROL[m.tipo_control] : '—', font: 'Arial', size: 16 })] })],
            }),
            new TableCell({
              width: { size: seqW[5], type: WidthType.DXA }, borders,
              shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(m.clasificacion_riesgo).toUpperCase(), font: 'Arial', size: 16, bold: true })] })],
            }),
          ] }))
      ),
    ],
  })

  // ── Marco Legal ──────────────────────────────────────────────────────────────
  const legalPar = [
    ['Ley N° 16.744', 'Establece Normas sobre Accidentes del Trabajo y Enfermedades Profesionales.'],
    ['Ley N° 21.643', 'Prevención, investigación y sanción del acoso laboral, sexual y violencia en el trabajo.'],
    ['D.S. N° 594',   'Condiciones Sanitarias y Ambientales Básicas en los Lugares de Trabajo.'],
    ['D.S. N° 44',    'Requisitos para la exención, rebaja y recargo de la cotización adicional diferenciada.'],
  ].map(([ley, desc]) => new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: `${ley} `, font: 'Arial', size: 18, bold: true, color: AZUL }),
      new TextRun({ text: `— ${desc}`, font: 'Arial', size: 18, color: '475569' }),
    ],
  }))

  // ── Cuadro Validación ────────────────────────────────────────────────────────
  const fw = Math.floor(W / 3)
  const valTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [fw, fw, W - fw * 2],
    rows: [
      new TableRow({ tableHeader: true, children: [
        th('Elaborado por', fw, true),
        th('Revisado por', fw, true),
        th('Aprobado por', W - fw * 2, true),
      ] }),
      new TableRow({ children: (
        ['elaborado', 'revisado', 'aprobado'] as const
      ).map((p, pi) => new TableCell({
        width: { size: pi < 2 ? fw : W - fw * 2, type: WidthType.DXA }, borders,
        margins: { top: 600, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 6, color: '94a3b8', space: 1 } }, children: [new TextRun({ text: pts[`${p}_nombre`] || ' ', font: 'Arial', size: 18, bold: true })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pts[`${p}_cargo`], font: 'Arial', size: 16, color: '64748b' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: fmtFecha(pts[`${p}_fecha`]), font: 'Arial', size: 16, color: '94a3b8' })] }),
        ],
      })) }),
    ],
  })

  // ── Documento final ──────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      headers: { default: new Header({ children: [] }) },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `${pts.codigo} · DS 44 · Pág. `, font: 'Arial', size: 14, color: '94a3b8' }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 14, color: '94a3b8' }),
          ],
        })] }),
      },
      children: [
        headerTable, empresaTable,
        new Paragraph({ spacing: { before: 200, after: 80 }, children: [
          new TextRun({ text: 'D.S. N° 44 · Ley N° 16.744 · Ley N° 21.643 · D.S. N° 594 — ', font: 'Arial', size: 16, bold: true, color: AZUL }),
          new TextRun({ text: `${empresa?.razon_social ?? '[Empresa]'} emite el presente PTS para garantizar la ejecución segura de ${tarea?.actividad ?? '[Tarea]'}.`, font: 'Arial', size: 16, color: '475569' }),
        ] }),
        secTitle('1', 'Objetivo y Alcance'), objTable,
        secTitle('2', 'Responsabilidades'), respTable,
        secTitle('3', 'Equipos, Herramientas y EPP'), eppTable,
        secTitle('4', 'Secuencia Operativa Segura y Evaluación de Riesgos'), seqTable,
        secTitle('5', 'Marco Legal'),
        ...legalPar,
        secTitle('6', 'Cuadro de Responsabilidades y Validación'), valTable,
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 200, after: 0 },
          children: [new TextRun({ text: `Generado por App MIPER · DS 44 · Ley 16.744 · ${new Date().toLocaleDateString('es-CL')}`, font: 'Arial', size: 14, color: '94a3b8' })],
        }),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `PTS_${pts.codigo}_${tarea?.actividad?.replace(/\s+/g, '_') ?? 'documento'}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
