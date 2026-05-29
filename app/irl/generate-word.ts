// ─── Generador Word para documento IRL ───────────────────────────────────────
// Usa la librería `docx` (client-side) para producir un .docx descargable

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, HeadingLevel,
  VerticalAlign,
} from 'docx'
import type { IrlRegistro, MiperRegistro, Tarea, Proceso, Empresa, CentroTrabajo } from '@/src/types'
import {
  LABEL_MOTIVO_IRL, LABEL_MODALIDAD_IRL, LABEL_TIPO_ACTIVIDAD_IRL, LABEL_CONTROL,
} from '@/src/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtFecha = (iso: string) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('es-CL') : '—'

const AZUL   = '1e3a5f'
const GRIS_H = 'e2e8f0'
const BLANCO = 'FFFFFF'

const border = { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' }
const borders = { top: border, bottom: border, left: border, right: border }

// Celda cabecera azul
function thCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: AZUL, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, font: 'Arial', size: 18, bold: true, color: BLANCO })],
    })],
  })
}

// Celda cabecera gris (etiqueta)
function labelCell(text: string, width = 2400): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: GRIS_H, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: 'Arial', size: 18, bold: true, color: '475569' })],
    })],
  })
}

// Celda de valor
function valCell(text: string, width: number, colspan = 1): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: colspan,
    borders,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      children: [new TextRun({ text: text || '—', font: 'Arial', size: 18, color: '1e293b' })],
    })],
  })
}

// Párrafo de sección
function sectionTitle(n: string, title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text: `${n}. `, font: 'Arial', size: 20, bold: true, color: AZUL }),
      new TextRun({ text: title.toUpperCase(), font: 'Arial', size: 20, bold: true, color: '1e293b' }),
    ],
  })
}

// ─── Tabla de dos columnas (label | value) ────────────────────────────────────

function infoTable(rows: [string, string, string, string][], full = false): Table {
  const totalW = 9360
  const lw = 2200
  const vw = full ? totalW - lw : Math.floor((totalW - lw * 2) / 2)

  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: full
      ? [lw, totalW - lw]
      : [lw, vw, lw, vw],
    rows: rows.map(([k1, v1, k2, v2]) => {
      const cells: TableCell[] = [labelCell(k1, lw), valCell(v1, full ? totalW - lw : vw, full || !k2 ? (full ? 1 : 3) : 1)]
      if (!full && k2) {
        cells.push(labelCell(k2, lw))
        cells.push(valCell(v2, vw))
      }
      return new TableRow({ children: cells })
    }),
  })
}

// ─── Exportar Word ────────────────────────────────────────────────────────────

export async function exportarWord(
  irl: IrlRegistro,
  { tarea, proceso, empresa, centro, miperRows }: {
    tarea?:     Tarea
    proceso?:   Proceso
    empresa:    Empresa | null
    centro:     CentroTrabajo | null
    miperRows:  MiperRegistro[]
  }
): Promise<void> {
  const totalW = 9360

  // ── Tabla encabezado principal ──────────────────────────────────────────────
  const headerTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: [2200, 5160, 2000],
    rows: [
      new TableRow({
        children: [
          // Logo placeholder (texto)
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            borders,
            shading: { fill: AZUL, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'PRSO', font: 'Arial', size: 24, bold: true, color: BLANCO })],
            })],
          }),
          // Título central
          new TableCell({
            width: { size: 5160, type: WidthType.DXA },
            borders,
            shading: { fill: AZUL, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'GESTIÓN DE RIESGOS DE SST', font: 'Arial', size: 20, bold: true, color: BLANCO })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'INFORMACIÓN DE RIESGOS LABORALES', font: 'Arial', size: 18, color: 'BDD7F0' })],
              }),
            ],
          }),
          // Código / Fecha
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            borders,
            shading: { fill: AZUL, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Código: IRL-001', font: 'Arial', size: 16, color: 'BDD7F0' })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `Fecha: ${fmtFecha(irl.fecha_entrega)}`, font: 'Arial', size: 16, color: 'BDD7F0' })],
              }),
            ],
          }),
        ],
      }),
    ],
  })

  // ── Tabla empresa / centro ──────────────────────────────────────────────────
  const empresaTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: [Math.floor(totalW / 2), Math.ceil(totalW / 2)],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: Math.floor(totalW / 2), type: WidthType.DXA },
            borders,
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'EMPRESA', font: 'Arial', size: 16, bold: true, color: '64748b' })] }),
              new Paragraph({ children: [new TextRun({ text: empresa?.razon_social ?? '—', font: 'Arial', size: 18, bold: true })] }),
              new Paragraph({ children: [new TextRun({ text: `RUT: ${empresa?.rut ?? '—'}`, font: 'Arial', size: 16, color: '64748b' })] }),
              new Paragraph({ children: [new TextRun({ text: empresa?.actividad_economica ?? '', font: 'Arial', size: 16, color: '64748b' })] }),
            ],
          }),
          new TableCell({
            width: { size: Math.ceil(totalW / 2), type: WidthType.DXA },
            borders,
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'CENTRO DE TRABAJO', font: 'Arial', size: 16, bold: true, color: '64748b' })] }),
              new Paragraph({ children: [new TextRun({ text: centro?.nombre ?? '—', font: 'Arial', size: 18, bold: true })] }),
              new Paragraph({ children: [new TextRun({ text: centro?.direccion ?? '—', font: 'Arial', size: 16, color: '64748b' })] }),
            ],
          }),
        ],
      }),
    ],
  })

  // ── Texto normativo ─────────────────────────────────────────────────────────
  const normativoPar = new Paragraph({
    spacing: { before: 160, after: 160 },
    shading: { fill: 'EFF6FF', type: ShadingType.CLEAR },
    border: {
      top:    { style: BorderStyle.SINGLE, size: 6, color: 'BFDBFE', space: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'BFDBFE', space: 1 },
      left:   { style: BorderStyle.THICK,  size: 12, color: '3B82F6', space: 4 },
      right:  { style: BorderStyle.SINGLE, size: 6, color: 'BFDBFE', space: 1 },
    },
    children: [
      new TextRun({ text: 'D.S. N° 44 — Título II, Párrafo 4, Art. 15: ', font: 'Arial', size: 16, bold: true, color: '1e40af' }),
      new TextRun({ text: 'Información de los riesgos laborales. ', font: 'Arial', size: 16, italics: true, color: '1e40af' }),
      new TextRun({ text: `${empresa?.razon_social ?? '[EMPRESA]'}`, font: 'Arial', size: 16, bold: true, color: '1e293b' }),
      new TextRun({ text: ', en el momento de incorporarse la persona trabajadora, emite el presente documento con el objeto de cumplir la obligación de informar de los riesgos que entrañan sus labores, medidas preventivas y métodos de trabajo correctos.', font: 'Arial', size: 16, color: '1e293b' }),
    ],
  })

  // ── Sección 1: Actividad ────────────────────────────────────────────────────
  const actividadTable = infoTable([
    ['Nombre de la actividad', irl.nombre_actividad, 'Fecha inicio — término', `${fmtFecha(irl.fecha_inicio)} — ${fmtFecha(irl.fecha_fin)}`],
    ['Modalidad', LABEL_MODALIDAD_IRL[irl.modalidad], 'N° de horas', irl.n_horas],
    ['Tipo de actividad', LABEL_TIPO_ACTIVIDAD_IRL[irl.tipo_actividad],
      irl.tipo_actividad === 'externa' ? 'Quién ejecuta' : 'Relator',
      irl.tipo_actividad === 'externa' ? irl.ejecutor_externo : `${irl.relator_nombre} (${irl.relator_cargo})`],
    ['Puesto / Grupo objetivo', irl.grupo_objetivo || tarea?.puesto_trabajo || '—', 'Proceso', proceso?.nombre ?? '—'],
  ])

  // ── Sección 2: Lugar de Trabajo ─────────────────────────────────────────────
  const lugarTable = infoTable([
    ['Espacio de trabajo',    irl.espacio_trabajo    || '—', '', ''],
    ['Cond. ambientales',     irl.condiciones_ambientales || '—', '', ''],
    ['Orden y aseo',          irl.condiciones_orden_aseo  || '—', '', ''],
    ['Máquinas / herramientas', irl.maquinas_herramientas || tarea?.equipos_involucrados || '—', '', ''],
  ], true)

  // ── Sección 3: Riesgos ──────────────────────────────────────────────────────
  const colWidths = [2400, 2000, 2480, 2480]
  const riesgosTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      // Cabecera
      new TableRow({
        tableHeader: true,
        children: [
          thCell('RIESGOS',                             colWidths[0]),
          thCell('CONSECUENCIAS',                       colWidths[1]),
          thCell('MEDIDAS DE CONTROL',                  colWidths[2]),
          thCell('MÉTODOS O PROCEDIMIENTOS DE TRABAJO', colWidths[3]),
        ],
      }),
      // Filas de datos
      ...(miperRows.length === 0
        ? [new TableRow({ children: [
            new TableCell({
              columnSpan: 4,
              width: { size: totalW, type: WidthType.DXA },
              borders,
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Sin riesgos registrados en MIPER', font: 'Arial', size: 18, color: '94a3b8' })],
              })],
            }),
          ] })]
        : miperRows.map((m, i) => new TableRow({
            children: [
              new TableCell({
                width: { size: colWidths[0], type: WidthType.DXA },
                borders,
                shading: { fill: i % 2 === 0 ? BLANCO : 'f8fafc', type: ShadingType.CLEAR },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: m.peligro, font: 'Arial', size: 18, bold: true, color: '1e293b' })] }),
                  new Paragraph({ children: [new TextRun({ text: m.riesgo, font: 'Arial', size: 16, color: '64748b' })] }),
                ],
              }),
              new TableCell({
                width: { size: colWidths[1], type: WidthType.DXA },
                borders,
                shading: { fill: i % 2 === 0 ? BLANCO : 'f8fafc', type: ShadingType.CLEAR },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: m.dano_probable || '—', font: 'Arial', size: 18, color: '1e293b' })] })],
              }),
              new TableCell({
                width: { size: colWidths[2], type: WidthType.DXA },
                borders,
                shading: { fill: i % 2 === 0 ? BLANCO : 'f8fafc', type: ShadingType.CLEAR },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: m.medida_control || '—', font: 'Arial', size: 18, color: '1e293b' })] })],
              }),
              new TableCell({
                width: { size: colWidths[3], type: WidthType.DXA },
                borders,
                shading: { fill: i % 2 === 0 ? BLANCO : 'f8fafc', type: ShadingType.CLEAR },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: m.tipo_control ? LABEL_CONTROL[m.tipo_control] : '—', font: 'Arial', size: 18, color: '1e293b' })] })],
              }),
            ],
          }))
      ),
    ],
  })

  // ── Sección 4: Material (opcional) ─────────────────────────────────────────
  const materialItems = irl.material_complemento && irl.materiales_json.length > 0
    ? infoTable(irl.materiales_json.map(m => [m.nombre, m.tipo, '', ''] as [string, string, string, string]), true)
    : null

  // ── Sección 5: Participante ─────────────────────────────────────────────────
  const participanteTable = infoTable([
    ['Nombre del trabajador', irl.nombre_trabajador, 'RUT', irl.rut_trabajador],
    ['Cargo',                 irl.cargo_trabajador,  'Motivo', LABEL_MOTIVO_IRL[irl.motivo]],
    ['Fecha de entrega',      fmtFecha(irl.fecha_entrega), '', ''],
  ])

  // ── Firmas ──────────────────────────────────────────────────────────────────
  const firmaW = Math.floor(totalW / 2)
  const firmaTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: [firmaW, totalW - firmaW],
    rows: [
      // Líneas de firma
      new TableRow({
        children: [
          new TableCell({
            width: { size: firmaW, type: WidthType.DXA },
            borders,
            margins: { top: 600, bottom: 80, left: 300, right: 300 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: '94a3b8', space: 1 } },
                children: [new TextRun({ text: 'FIRMA DEL TRABAJADOR', font: 'Arial', size: 16, bold: true, color: '475569' })],
              }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: irl.nombre_trabajador, font: 'Arial', size: 16, color: '64748b' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: irl.cargo_trabajador, font: 'Arial', size: 16, color: '64748b' })] }),
            ],
          }),
          new TableCell({
            width: { size: totalW - firmaW, type: WidthType.DXA },
            borders,
            margins: { top: 600, bottom: 80, left: 300, right: 300 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: '94a3b8', space: 1 } },
                children: [new TextRun({ text: 'FIRMA DEL RELATOR', font: 'Arial', size: 16, bold: true, color: '475569' })],
              }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: irl.relator_nombre, font: 'Arial', size: 16, color: '64748b' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: irl.relator_cargo, font: 'Arial', size: 16, color: '64748b' })] }),
            ],
          }),
        ],
      }),
    ],
  })

  // ── Armar documento ─────────────────────────────────────────────────────────
  const children = [
    headerTable,
    empresaTable,
    normativoPar,

    sectionTitle('1', 'Información de la Actividad'),
    actividadTable,

    sectionTitle('2', 'Características del Lugar de Trabajo'),
    lugarTable,

    sectionTitle('3', 'Información de los Riesgos'),
    riesgosTable,

    ...(materialItems ? [sectionTitle('4', 'Material de Complemento'), materialItems] : []),

    sectionTitle(materialItems ? '5' : '4', 'Información del Participante'),
    participanteTable,

    new Paragraph({ spacing: { before: 300, after: 0 } }),
    firmaTable,

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 0 },
      children: [new TextRun({
        text: `Generado por App MIPER · DS 44 · Ley 16.744 · ${new Date().toLocaleDateString('es-CL')}`,
        font: 'Arial', size: 14, color: '94a3b8',
      })],
    }),
  ]

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      headers: {
        default: new Header({ children: [] }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'IRL-001 · DS 44 · Página ', font: 'Arial', size: 14, color: '94a3b8' }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 14, color: '94a3b8' }),
            ],
          })],
        }),
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `IRL_${irl.nombre_trabajador.replace(/\s+/g, '_')}_${irl.fecha_entrega}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
