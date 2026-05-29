// ─── Generador Word para PTS ──────────────────────────────────────────────────

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, BorderStyle, WidthType, ShadingType,
  Footer, PageNumber, VerticalAlign, Header,
} from 'docx'
import type { PtsRegistro, MiperRegistro, Tarea, Proceso, Empresa, CentroTrabajo } from '@/src/types'
// LABEL_CONTROL ya no se usa — tabla simplificada a 3 columnas

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

  // ── Descripción de la Actividad ──────────────────────────────────────────────
  const descTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [
      new TableRow({ children: [
        new TableCell({
          width: { size: W, type: WidthType.DXA }, borders, margins: pad,
          children: (pts.descripcion_actividad || '—').split('\n').map(
            line => new Paragraph({ children: [new TextRun({ text: line, font: 'Arial', size: 18, color: '334155' })] })
          ),
        }),
      ] }),
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

  // ── Definiciones Legales y Técnicas ─────────────────────────────────────────
  const definiciones: [string, string][] = [
    ['Accidente del Trabajo',         'Toda lesión que una persona sufra a causa o con ocasión del trabajo, y que le produzca incapacidad o muerte (Art. 5, Ley N° 16.744).'],
    ['Accidente de Trayecto',          'Ocurridos en el trayecto directo, de ida o regreso, entre la habitación y el lugar del trabajo, o entre dos lugares de trabajo distintos (Art. 5, Ley N° 16.744).'],
    ['Enfermedad Profesional',         'La causada de manera directa por el ejercicio de la profesión o el trabajo que realice una persona y que le produzca incapacidad o muerte (Art. 7, Ley N° 16.744).'],
    ['Acoso y Violencia en el Trabajo','Conductas de agresión u hostigamiento reiterado (acoso laboral), no reiterado (acoso sexual) o violencia por terceros. Deben garantizarse entornos libres de violencia (Ley N° 21.643).'],
    ['EPP',                            'Todo equipo, aparato o dispositivo fabricado para preservar el cuerpo humano de riesgos específicos de accidentes del trabajo o enfermedades profesionales (D.S. N° 594).'],
    ['Peligro',                        'Fuente, situación o acto con potencial para causar daño humano, deterioro de la salud, o daños materiales a los equipos e instalaciones.'],
    ['Riesgo',                         'Probabilidad de que un peligro se materialice en determinadas condiciones y produzca daños. Su evaluación estima la magnitud para decidir si son tolerables.'],
    ['Incidente',                      'Evento relacionado con el trabajo en el que ocurrió o pudo haber ocurrido lesión, enfermedad o fatalidad. Sin daños, se denomina cuasi accidente.'],
    ['Acción Subestándar',             'Todo acto u omisión del trabajador que viola un procedimiento o normativa de seguridad.'],
    ['Condición Subestándar',          'Desviación en el entorno físico o en los equipos que representa un peligro para las personas o las instalaciones.'],
  ]
  const defCols = [2200, W - 2200]
  const defTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: defCols,
    rows: [
      new TableRow({ tableHeader: true, children: [th('Término', defCols[0]), th('Definición', defCols[1])] }),
      ...definiciones.map(([term, def], i) => new TableRow({ children: [
        new TableCell({
          width: { size: defCols[0], type: WidthType.DXA }, borders,
          shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
          children: [new Paragraph({ children: [new TextRun({ text: term, font: 'Arial', size: 18, bold: true, color: AZUL })] })],
        }),
        new TableCell({
          width: { size: defCols[1], type: WidthType.DXA }, borders,
          shading: { fill: i % 2 === 0 ? WHITE : 'f8fafc', type: ShadingType.CLEAR }, margins: pad,
          children: [new Paragraph({ children: [new TextRun({ text: def, font: 'Arial', size: 18, color: '475569' })] })],
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

  // ── Secuencia Operativa, Riesgos y Medidas de Control ───────────────────────
  const seqW = [400, 4180, W - 400 - 4180]
  const seqTable = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: seqW,
    rows: [
      new TableRow({ tableHeader: true, children: [
        th('N°', seqW[0], true),
        th('Riesgos Presentes', seqW[1]),
        th('Medidas de Control', seqW[2]),
      ] }),
      ...(miperRows.length === 0
        ? [new TableRow({ children: [new TableCell({
            columnSpan: 3, width: { size: W, type: WidthType.DXA }, borders, margins: pad,
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
              children: [new Paragraph({ children: [new TextRun({ text: m.medida_control || '—', font: 'Arial', size: 18 })] })],
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

  // ── Cuadro Validación (Elaborado / Revisado / Aprobado) ─────────────────────
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

  // ── Tabla Trabajador ─────────────────────────────────────────────────────────
  const sigW = [Math.floor(W * 0.35), Math.floor(W * 0.18), Math.floor(W * 0.22), W - Math.floor(W * 0.35) - Math.floor(W * 0.18) - Math.floor(W * 0.22)]
  function sigTable(titulo: string): Table {
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: sigW,
      rows: [
        new TableRow({ tableHeader: true, children: [
          new TableCell({
            columnSpan: 4, width: { size: W, type: WidthType.DXA }, borders,
            shading: { fill: 'e2e8f0', type: ShadingType.CLEAR }, margins: pad,
            children: [new Paragraph({ children: [new TextRun({ text: titulo, font: 'Arial', size: 18, bold: true, color: '1e3a5f' })] })],
          }),
        ] }),
        new TableRow({ tableHeader: true, children: [
          th('Nombre', sigW[0]), th('RUT', sigW[1], true), th('Cargo', sigW[2]), th('Firma', sigW[3], true),
        ] }),
        new TableRow({ children: sigW.map((w, wi) => new TableCell({
          width: { size: w, type: WidthType.DXA }, borders,
          margins: { top: 400, bottom: 400, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: wi === sigW.length - 1 ? '' : ' ', font: 'Arial', size: 20 })] })],
        })) }),
      ],
    })
  }
  const trabajadorTable   = sigTable('Datos del Trabajador')
  const responsableTable  = sigTable('Responsable de Capacitación')

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
        secTitle('3', 'Definiciones Legales y Técnicas'), defTable,
        secTitle('4', 'Equipos, Herramientas y EPP'), eppTable,
        secTitle('5', 'Descripción de Actividades a Realizar'), descTable,
        secTitle('6', 'Secuencia Operativa, Riesgos y Medidas de Control'), seqTable,
        secTitle('7', 'Marco Legal'),
        ...legalPar,
        secTitle('8', 'Cuadro de Responsabilidades y Validación'), valTable,
        new Paragraph({ spacing: { before: 200, after: 60 } }),
        trabajadorTable,
        new Paragraph({ spacing: { before: 200, after: 60 } }),
        responsableTable,
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
