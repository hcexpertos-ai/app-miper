import type { Probabilidad, Consecuencia, ClasificacionRiesgo, MiperRegistro } from '../types'

// ─── Tablas de valores fijos (DS 44) ─────────────────────────────────────────

const VALOR_P: Record<Probabilidad, number> = { baja: 1, media: 2, alta: 4 }
const VALOR_C: Record<Consecuencia, number> = {
  ligeramente_danino: 1,
  danino: 2,
  extremadamente_danino: 4,
}

// ─── Cálculo central ─────────────────────────────────────────────────────────

export function calcularMR(p: Probabilidad, c: Consecuencia): number {
  return VALOR_P[p] * VALOR_C[c]
}

export function clasificarRiesgo(mr: number): ClasificacionRiesgo {
  if (mr <= 2) return 'tolerable'
  if (mr === 4) return 'moderado'
  if (mr === 8) return 'importante'
  return 'intolerable'
}

export function evaluarRiesgo(p: Probabilidad, c: Consecuencia) {
  const mr = calcularMR(p, c)
  return { mr, clasificacion: clasificarRiesgo(mr) }
}

// ─── Estadísticas para dashboard ─────────────────────────────────────────────

export interface Stats {
  total: number
  tolerable: number
  moderado: number
  importante: number
  intolerable: number
  controlados: number
  pct_controlados: number
  pct_criticos: number  // importante + intolerable
}

export function calcularStats(registros: MiperRegistro[]): Stats {
  const total = registros.length
  if (total === 0) {
    return { total: 0, tolerable: 0, moderado: 0, importante: 0, intolerable: 0,
             controlados: 0, pct_controlados: 0, pct_criticos: 0 }
  }

  const tolerable   = registros.filter(r => r.clasificacion_riesgo === 'tolerable').length
  const moderado    = registros.filter(r => r.clasificacion_riesgo === 'moderado').length
  const importante  = registros.filter(r => r.clasificacion_riesgo === 'importante').length
  const intolerable = registros.filter(r => r.clasificacion_riesgo === 'intolerable').length
  const controlados = registros.filter(r => r.esta_controlado).length

  return {
    total, tolerable, moderado, importante, intolerable, controlados,
    pct_controlados: Math.round((controlados / total) * 100),
    pct_criticos:    Math.round(((importante + intolerable) / total) * 100),
  }
}
