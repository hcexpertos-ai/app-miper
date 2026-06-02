// ─── Enums ───────────────────────────────────────────────────────────────────

export type TipoProceso       = 'operacional' | 'apoyo'
export type Probabilidad      = 'baja' | 'media' | 'alta'
export type Consecuencia      = 'ligeramente_danino' | 'danino' | 'extremadamente_danino'
export type ClasificacionRiesgo = 'tolerable' | 'moderado' | 'importante' | 'intolerable'
export type TipoControl       = 'eliminacion' | 'sustitucion' | 'ingenieria' | 'administrativo' | 'epp'
export type EstadoPrograma    = 'pendiente' | 'en_proceso' | 'completado' | 'vencido'
// Catálogo Anexo N°3 — Guía V3 2024 (valor almacenado = código, ej: "A1", "O3", "D5")
export type FactorRiesgoMiper = string

// ─── Módulo 1: Levantamiento ─────────────────────────────────────────────────

export interface Empresa {
  id: string
  razon_social: string
  rut: string
  actividad_economica: string
  comuna: string
}

export interface CentroTrabajo {
  id: string
  empresa_id: string
  nombre: string
  direccion: string
  n_trabajadores_hombres: number
  n_trabajadores_mujeres: number
  n_trabajadores_otro: number
}

export interface Proceso {
  id: string
  centro_trabajo_id: string
  nombre: string
  tipo: TipoProceso
  responsable_levantamiento: string
  fecha_levantamiento: string
}

export interface Tarea {
  id: string
  proceso_id: string
  actividad: string
  descripcion_tarea: string
  puesto_trabajo: string
  lugar_ejecucion: string
  es_rutinaria: boolean
  n_trabajadores_hombres: number
  n_trabajadores_mujeres: number
  n_trabajadores_otro: number
  equipos_involucrados: string
  materiales_sustancias: string
  /** Observaciones para el informe de levantamiento DS 44.
   *  Requiere migración SQL: ALTER TABLE tareas ADD COLUMN IF NOT EXISTS observaciones TEXT NOT NULL DEFAULT ''; */
  observaciones?: string
}

// ─── Módulo 2: MIPER ─────────────────────────────────────────────────────────

export interface MiperRegistro {
  id: string
  tarea_id: string
  peligro: string
  riesgo: string
  dano_probable: string
  factor_riesgo: FactorRiesgoMiper | ''
  probabilidad: Probabilidad
  consecuencia: Consecuencia
  mr: number
  clasificacion_riesgo: ClasificacionRiesgo
  tipo_control: TipoControl | ''
  medida_control: string
  responsable_control: string
  plazo_control: string | null
  esta_controlado: boolean
  fecha_elaboracion: string
}

// ─── Módulo 3: Programa de Trabajo ───────────────────────────────────────────

export interface ProgramaTrabajo {
  id: string
  miper_id: string
  numero_programa: number
  proceso_nombre: string
  centro_trabajo_nombre: string
  actividad_medida_control: string
  responsable: string
  fecha_ejecucion_programada: string
  fecha_ejecucion_efectiva: string
  porcentaje_avance: number
  estado: EstadoPrograma
}

// ─── Labels UI ───────────────────────────────────────────────────────────────

export const LABEL_PROBABILIDAD: Record<Probabilidad, string> = {
  baja:  'Baja (1)',
  media: 'Media (2)',
  alta:  'Alta (4)',
}

export const LABEL_CONSECUENCIA: Record<Consecuencia, string> = {
  ligeramente_danino:    'Ligeramente Dañino (1)',
  danino:                'Dañino (2)',
  extremadamente_danino: 'Extremadamente Dañino (4)',
}

export const LABEL_CONTROL: Record<TipoControl, string> = {
  eliminacion:    'I — Eliminación',
  sustitucion:    'II — Sustitución',
  ingenieria:     'III — Ingeniería',
  administrativo: 'IV — Administrativo',
  epp:            'V — EPP',
}

export const LABEL_TIPO_PROCESO: Record<TipoProceso, string> = {
  operacional: 'Operacional',
  apoyo:       'Apoyo',
}

export const LABEL_ESTADO: Record<EstadoPrograma, string> = {
  pendiente:  'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  vencido:    'Vencido',
}

// ─── Catálogo de Factores de Riesgo — Anexo N°3 Guía V3 2024 ─────────────────

export interface CatalogoGrupoRiesgo {
  grupo: string
  opciones: { codigo: string; label: string }[]
}

export const CATALOGO_RIESGOS: CatalogoGrupoRiesgo[] = [
  {
    grupo: 'Seguridad y Emergencias',
    opciones: [
      { codigo: 'A1', label: 'A1 — Caídas al mismo nivel' },
      { codigo: 'A2', label: 'A2 — Caídas a distinto nivel' },
      { codigo: 'A3', label: 'A3 — Caídas de altura' },
      { codigo: 'A4', label: 'A4 — Caídas al agua' },
      { codigo: 'B1', label: 'B1 — Atrapamiento' },
      { codigo: 'B2', label: 'B2 — Caída de objetos' },
      { codigo: 'B3', label: 'B3 — Cortes por objetos/herramientas cortopunzantes' },
      { codigo: 'B4', label: 'B4 — Choque contra objetos (móviles e inmóviles)' },
      { codigo: 'C1', label: 'C1 — Contacto con personas (acciones de terceros)' },
      { codigo: 'C2', label: 'C2 — Contacto con animales y/o insectos' },
      { codigo: 'E1', label: 'E1 — Contactos térmicos por calor' },
      { codigo: 'E2', label: 'E2 — Contactos térmicos por frío' },
      { codigo: 'F1', label: 'F1 — Contactos eléctricos directos baja tensión' },
      { codigo: 'F2', label: 'F2 — Contactos eléctricos directos alta tensión' },
      { codigo: 'F3', label: 'F3 — Contactos eléctricos indirectos baja tensión' },
      { codigo: 'F4', label: 'F4 — Contactos eléctricos indirectos alta tensión' },
      { codigo: 'G1', label: 'G1 — Contacto con sustancias cáusticas/corrosivas' },
      { codigo: 'G2', label: 'G2 — Contacto con otras sustancias químicas' },
      { codigo: 'H1', label: 'H1 — Explosiones' },
      { codigo: 'H2', label: 'H2 — Proyección de fragmentos y/o partículas' },
      { codigo: 'I1', label: 'I1 — Atropellos o golpes con vehículos' },
      { codigo: 'I2', label: 'I2 — Choque, colisión o volcamiento' },
      { codigo: 'J',  label: 'J — Incendios' },
      { codigo: 'K1', label: 'K1 — Deficiencia de oxígeno (asfixia)' },
      { codigo: 'K2', label: 'K2 — Sustancias químicas tóxicas' },
      { codigo: 'L1', label: 'L1 — Radiaciones no ionizantes' },
      { codigo: 'L2', label: 'L2 — Radiaciones ionizantes' },
      { codigo: 'M',  label: 'M — Ingesta de sustancias nocivas' },
      { codigo: 'N',  label: 'N — Otros riesgos de seguridad' },
    ],
  },
  {
    grupo: 'Higiénicos',
    opciones: [
      { codigo: 'O1', label: 'O1 — Aerosoles sólidos (polvo, humos, fibras)' },
      { codigo: 'O2', label: 'O2 — Aerosoles líquidos (niebla, neblina)' },
      { codigo: 'O3', label: 'O3 — Gases y vapores' },
      { codigo: 'P1', label: 'P1 — Ruido' },
      { codigo: 'P2', label: 'P2 — Vibraciones cuerpo completo' },
      { codigo: 'P3', label: 'P3 — Vibraciones mano-brazo' },
      { codigo: 'P4', label: 'P4 — Radiaciones ionizantes (higiene)' },
      { codigo: 'P5', label: 'P5 — Radiaciones no ionizantes (higiene)' },
      { codigo: 'P6', label: 'P6 — Calor' },
      { codigo: 'P7', label: 'P7 — Frío' },
      { codigo: 'P8', label: 'P8 — Altas presiones' },
      { codigo: 'P9', label: 'P9 — Bajas presiones' },
      { codigo: 'Q1', label: 'Q1 — Agentes biológicos: fluidos corporales' },
      { codigo: 'Q2', label: 'Q2 — Agentes biológicos: inhalación/dermal/oral' },
    ],
  },
  {
    grupo: 'Músculo Esqueléticos',
    opciones: [
      { codigo: 'R1', label: 'R1 — Sobrecarga física: manipulación manual de cargas' },
      { codigo: 'R2', label: 'R2 — Manipulación de personas/pacientes' },
      { codigo: 'S1', label: 'S1 — Trabajo repetitivo de miembros superiores' },
      { codigo: 'T1', label: 'T1 — Trabajo de pie' },
      { codigo: 'T2', label: 'T2 — Trabajo sentado' },
      { codigo: 'T3', label: 'T3 — Trabajo en cuclillas' },
      { codigo: 'T4', label: 'T4 — Trabajo arrodillado' },
      { codigo: 'T5', label: 'T5 — Tronco inclinado/torsión/lateralización' },
      { codigo: 'T6', label: 'T6 — Flexión/extensión columna cervical' },
      { codigo: 'T7', label: 'T7 — Fuera del alcance funcional' },
      { codigo: 'T8', label: 'T8 — Actividad muscular estática' },
    ],
  },
  {
    grupo: 'Psicosociales',
    opciones: [
      { codigo: 'D1',  label: 'D1 — Carga de trabajo' },
      { codigo: 'D2',  label: 'D2 — Exigencias emocionales' },
      { codigo: 'D3',  label: 'D3 — Desarrollo profesional' },
      { codigo: 'D4',  label: 'D4 — Reconocimiento y claridad de rol' },
      { codigo: 'D5',  label: 'D5 — Conflicto de rol' },
      { codigo: 'D6',  label: 'D6 — Calidad del liderazgo' },
      { codigo: 'D7',  label: 'D7 — Compañerismo y relación con el grupo de trabajo' },
      { codigo: 'D8',  label: 'D8 — Inseguridad en condiciones de trabajo' },
      { codigo: 'D9',  label: 'D9 — Equilibrio trabajo-vida privada' },
      { codigo: 'D10', label: 'D10 — Confianza y justicia organizacional' },
      { codigo: 'D11', label: 'D11 — Vulnerabilidad' },
      { codigo: 'D12', label: 'D12 — Violencia y acoso' },
    ],
  },
]

/** Mapa plano código → etiqueta completa */
export const LABEL_CATALOGO_RIESGO: Record<string, string> = Object.fromEntries(
  CATALOGO_RIESGOS.flatMap(g => g.opciones.map(o => [o.codigo, o.label]))
)

/**
 * Determina la categoría de evaluación según el código del catálogo.
 * - Higiénicos:     O, P, Q
 * - Músculo:        R, S, T
 * - Psicosociales:  D
 * - Seguridad:      todo lo demás (A, B, C, E, F, G, H, I, J, K, L, M, N)
 *                   + valores legados (factor_humano, etc.)
 */
export function categoriaEvaluacion(
  codigo: string
): 'seguridad' | 'higienico' | 'musculo' | 'psicosocial' {
  if (!codigo) return 'seguridad'
  const c = codigo.trim().toUpperCase()
  if (/^[OPQ]/.test(c)) return 'higienico'
  if (/^[RST]/.test(c)) return 'musculo'
  if (/^D\d/.test(c))   return 'psicosocial'
  return 'seguridad'
}

export const COLOR_RIESGO: Record<ClasificacionRiesgo, string> = {
  tolerable:   'bg-green-100 text-green-800 border border-green-300',
  moderado:    'bg-yellow-100 text-yellow-800 border border-yellow-300',
  importante:  'bg-orange-100 text-orange-800 border border-orange-300',
  intolerable: 'bg-red-100 text-red-800 border border-red-300',
}

export const COLOR_ESTADO: Record<EstadoPrograma, string> = {
  pendiente:  'bg-slate-100 text-slate-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  completado: 'bg-green-100 text-green-700',
  vencido:    'bg-red-100 text-red-700',
}

// ─── Módulo 4: IRL — Información de Riesgos Laborales ────────────────────────

export type ModalidadIrl     = 'presencial' | 'elearning'
export type TipoActividadIrl = 'interna' | 'externa'
export type MotivoIrl        = 'nuevo' | 'transferido' | 'ausencia_prolongada' | 'reinstruccion'

export interface MaterialAdjunto {
  nombre: string
  tipo:   string
}

export interface IrlRegistro {
  id: string
  tarea_id: string
  // Información de la actividad
  nombre_actividad:  string
  fecha_inicio:      string
  fecha_fin:         string
  modalidad:         ModalidadIrl
  n_horas:           string
  tipo_actividad:    TipoActividadIrl
  ejecutor_externo:  string
  relator_nombre:    string
  relator_cargo:     string
  grupo_objetivo:    string
  // Características del lugar de trabajo
  espacio_trabajo:         string
  condiciones_ambientales: string
  condiciones_orden_aseo:  string
  maquinas_herramientas:   string
  // Material de complemento
  material_complemento: boolean
  materiales_json:      MaterialAdjunto[]
  // Información del participante
  nombre_trabajador: string
  rut_trabajador:    string
  cargo_trabajador:  string
  motivo:            MotivoIrl
  fecha_entrega:     string
  created_at?:       string
}

// ─── Módulo 5: PTS — Procedimiento de Trabajo Seguro ─────────────────────────

export interface PtsRegistro {
  id: string
  tarea_id: string
  codigo: string
  version: string
  objetivo: string
  alcance: string
  /** Descripción de las actividades a realizar y motivo del procedimiento. */
  descripcion_actividad: string
  epp_basico: string
  epp_especifico: string
  elaborado_nombre: string
  elaborado_cargo: string
  elaborado_fecha: string
  revisado_nombre: string
  revisado_cargo: string
  revisado_fecha: string
  aprobado_nombre: string
  aprobado_cargo: string
  aprobado_fecha: string
  fecha_elaboracion: string
  created_at?: string
}

export const LABEL_MOTIVO_IRL: Record<MotivoIrl, string> = {
  nuevo:               'Trabajador Nuevo',
  transferido:         'Trabajador Transferido',
  ausencia_prolongada: 'Ausencia Prolongada',
  reinstruccion:       'Reinstrucción',
}

export const LABEL_MODALIDAD_IRL: Record<ModalidadIrl, string> = {
  presencial: 'Presencial',
  elearning:  'E-learning',
}

export const LABEL_TIPO_ACTIVIDAD_IRL: Record<TipoActividadIrl, string> = {
  interna: 'Interna',
  externa: 'Externa',
}
