// =============================================================
// APP MIPER · Tipos TypeScript — Módulo IA Predictiva
// =============================================================

import type { Probabilidad, Consecuencia, ClasificacionRiesgo, TipoControl } from './index'

// ─── Enums IA ─────────────────────────────────────────────────────────────────

export type EstadoRevisionIA = 'pendiente' | 'aceptada' | 'editada' | 'rechazada'
export type NivelConfianza   = 'alta' | 'media' | 'baja'
export type ModoIA           = 'local' | 'externo' | 'hibrido'

export type FactorRiesgo =
  | 'factor_humano'
  | 'maquinas_herramientas'
  | 'materias_primas'
  | 'ambiente_trabajo'

// ─── Estructuras de una sugerencia ────────────────────────────────────────────

export interface MedidaControlSugerida {
  tipoControl: TipoControl
  descripcion: string
  responsableSugerido: string
  plazoSugerido: string          // descriptivo: "30 días", "Inmediato"
  requiereProgramaTrabajo: boolean
}

export interface NormativaItem {
  norma: string
  fundamento: string
}

export interface SugerenciaIA {
  peligro: string
  riesgo: string
  consecuenciaEsperada: string
  factorRiesgo: FactorRiesgo
  probabilidadSugerida: Probabilidad
  consecuenciaSugerida: Consecuencia
  magnitudRiesgo: number
  clasificacionRiesgo: ClasificacionRiesgo
  jerarquiaControl: TipoControl
  medidasControl: MedidaControlSugerida[]
  normativaRelacionada: NormativaItem[]
  justificacionTecnica: string
  nivelConfianza: NivelConfianza
}

// ─── Contexto enviado al motor de IA ──────────────────────────────────────────

export interface ContextoTarea {
  empresa_razon_social:   string
  empresa_actividad:      string
  centro_nombre:          string
  proceso_nombre:         string
  proceso_tipo:           string
  actividad:              string
  descripcion_tarea:      string
  puesto_trabajo:         string
  lugar_ejecucion:        string
  equipos_involucrados:   string
  materiales_sustancias:  string
  n_trabajadores_total:   number
  es_rutinaria:           boolean
}

// ─── Registro persistido en Supabase ──────────────────────────────────────────

export interface MiperSugerenciaIA {
  id:                   string
  miper_id?:            string        // nullable si aún no se guardó el registro MIPER
  tarea_id:             string
  contexto_json:        ContextoTarea
  sugerencia_json:      SugerenciaIA
  estado_revision:      EstadoRevisionIA
  aprobado_por?:        string
  fecha_generacion:     string
  fecha_revision?:      string
  observacion_usuario?: string
}

// ─── Labels de apoyo UI ───────────────────────────────────────────────────────

export const LABEL_FACTOR_RIESGO: Record<FactorRiesgo, string> = {
  factor_humano:        'Factor Humano',
  maquinas_herramientas:'Máquinas / Herramientas',
  materias_primas:      'Materias Primas / Sustancias',
  ambiente_trabajo:     'Ambiente de Trabajo',
}

export const LABEL_CONFIANZA: Record<NivelConfianza, string> = {
  alta:  'Confianza Alta',
  media: 'Confianza Media',
  baja:  'Confianza Baja',
}

export const COLOR_CONFIANZA: Record<NivelConfianza, string> = {
  alta:  'bg-green-100 text-green-800 border border-green-300',
  media: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  baja:  'bg-orange-100 text-orange-800 border border-orange-300',
}
