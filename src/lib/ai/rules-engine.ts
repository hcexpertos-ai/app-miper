// =============================================================
// APP MIPER · Motor de Reglas Local — Módulo IA Predictiva
// Offline-capable keyword matching engine
// =============================================================

import type { ContextoTarea, SugerenciaIA } from '../../types/ai'
import { REGLAS_MIPER } from './rules-library'

// ─── Normalización ────────────────────────────────────────────────────────────

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // eliminar tildes
    .replace(/[^a-z0-9\s]/g, ' ')    // eliminar caracteres especiales
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Corpus desde contexto ────────────────────────────────────────────────────

function buildCorpus(ctx: ContextoTarea): string {
  return normalizar([
    ctx.empresa_actividad,
    ctx.proceso_nombre,
    ctx.proceso_tipo,
    ctx.actividad,
    ctx.descripcion_tarea,
    ctx.puesto_trabajo,
    ctx.lugar_ejecucion,
    ctx.equipos_involucrados,
    ctx.materiales_sustancias,
  ].filter(Boolean).join(' '))
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

interface ReglaScore {
  reglaId:    string
  score:      number
  matches:    string[]
  sugerencias: SugerenciaIA[]
}

function scorear(corpus: string, palabras: string[]): { score: number; matches: string[] } {
  const matches: string[] = []

  for (const kw of palabras) {
    const kwNorm = normalizar(kw)
    // substring match — "panaderia" matchea "panadería industrial"
    if (corpus.includes(kwNorm)) {
      matches.push(kw)
    }
  }

  return { score: matches.length, matches }
}

// ─── Motor principal ──────────────────────────────────────────────────────────

/**
 * Analiza el contexto de una tarea y retorna sugerencias ordenadas
 * por relevancia. Expande cada sugerencia en variantes, una por cada
 * nivel de jerarquía de control definido (ingeniería, administrativo, EPP…),
 * para que el usuario pueda elegir entre múltiples opciones.
 */
export function generarSugerenciasLocales(
  contexto: ContextoTarea,
  topN = 5,
): SugerenciaIA[] {
  const corpus = buildCorpus(contexto)

  const scored: ReglaScore[] = REGLAS_MIPER.map(regla => {
    const { score, matches } = scorear(corpus, regla.keywords)
    return { reglaId: regla.id, score, matches, sugerencias: regla.sugerencias }
  })

  // Filtrar por umbral y ordenar por score desc
  const relevantes = scored
    .filter(r => r.score >= REGLAS_MIPER.find(x => x.id === r.reglaId)!.threshold)
    .sort((a, b) => b.score - a.score)

  // Expandir cada sugerencia en variantes: una por cada medida de control distinta
  // → el usuario ve "Opción 1: Ingeniería", "Opción 2: Administrativo", etc.
  const variantes: SugerenciaIA[] = []

  for (const r of relevantes) {
    for (const sugerencia of r.sugerencias) {
      for (const medida of sugerencia.medidasControl) {
        variantes.push({
          ...sugerencia,
          jerarquiaControl: medida.tipoControl as SugerenciaIA['jerarquiaControl'],
          medidasControl:   [medida],   // una sola medida por variante
        })
        if (variantes.length >= topN) break
      }
      if (variantes.length >= topN) break
    }
    if (variantes.length >= topN) break
  }

  // Si no se alcanzaron topN variantes, completar con sugerencias sin expandir
  if (variantes.length === 0) {
    for (const r of relevantes) {
      variantes.push(...r.sugerencias)
      if (variantes.length >= topN) break
    }
  }

  return variantes.slice(0, topN)
}

/**
 * Retorna las reglas con sus scores para debug / UI de confianza.
 */
export function debugScores(contexto: ContextoTarea): Array<{
  reglaId: string
  nombre: string
  score: number
  threshold: number
  matches: string[]
}> {
  const corpus = buildCorpus(contexto)

  return REGLAS_MIPER.map(regla => {
    const { score, matches } = scorear(corpus, regla.keywords)
    return { reglaId: regla.id, nombre: regla.nombre, score, threshold: regla.threshold, matches }
  }).sort((a, b) => b.score - a.score)
}
