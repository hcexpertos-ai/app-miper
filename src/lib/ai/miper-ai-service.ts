// =============================================================
// APP MIPER · Servicio IA — Módulo IA Predictiva
// Abstraction layer: local rules / external API / hybrid
// =============================================================

import type { ContextoTarea, SugerenciaIA, ModoIA } from '../../types/ai'
import { generarSugerenciasLocales } from './rules-engine'

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export interface ResultadoIA {
  sugerencias: SugerenciaIA[]
  modo:        ModoIA
  duracionMs:  number
  error?:      string
}

// ─── Modo LOCAL (offline) ─────────────────────────────────────────────────────

async function ejecutarLocal(contexto: ContextoTarea): Promise<ResultadoIA> {
  const t0 = Date.now()
  const sugerencias = generarSugerenciasLocales(contexto, 3)
  return {
    sugerencias,
    modo: 'local',
    duracionMs: Date.now() - t0,
  }
}

// ─── Modo EXTERNO (stub — preparado para OpenAI / Claude) ────────────────────
//
// Para activar: descomentar la llamada real y agregar las variables de entorno:
//   OPENAI_API_KEY  o  ANTHROPIC_API_KEY
//
// El prompt se construye a partir del contexto estructurado y se espera un JSON
// con el schema de SugerenciaIA[].

async function ejecutarExterno(contexto: ContextoTarea): Promise<ResultadoIA> {
  const t0 = Date.now()

  /* ── STUB: descomentar para activar ──────────────────────────────────────
  const prompt = buildPromptExterno(contexto)

  const res = await fetch('/api/ia/sugerir', {     // Next.js API Route
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contexto, prompt }),
  })

  if (!res.ok) {
    throw new Error(`API externa respondió ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()
  return {
    sugerencias: data.sugerencias as SugerenciaIA[],
    modo: 'externo',
    duracionMs: Date.now() - t0,
  }
  ── FIN STUB ──────────────────────────────────────────────────────────── */

  // Mientras el stub no esté activo, delegar al motor local con label 'externo'
  const local = await ejecutarLocal(contexto)
  return { ...local, modo: 'externo', duracionMs: Date.now() - t0 }
}

// ─── Modo HÍBRIDO: externo con fallback local ─────────────────────────────────

async function ejecutarHibrido(contexto: ContextoTarea): Promise<ResultadoIA> {
  try {
    return await ejecutarExterno(contexto)
  } catch {
    // Fallback silencioso al motor local
    const local = await ejecutarLocal(contexto)
    return {
      ...local,
      modo: 'hibrido',
    }
  }
}

// ─── Prompt builder (para uso futuro con API externa) ─────────────────────────

export function buildPromptExterno(ctx: ContextoTarea): string {
  return `Eres un experto en prevención de riesgos laborales según la normativa chilena
(DS 44, Ley 16.744, DS 594, Ley Karin 21.643, PREXOR, TMERT, PLANESI, Protocolo Sílice).

Analiza la siguiente tarea y genera hasta 3 sugerencias de riesgo en formato JSON
con el schema exacto de SugerenciaIA[]. Responde SOLO con el array JSON, sin markdown.

## Contexto de la tarea
- Empresa: ${ctx.empresa_razon_social} (${ctx.empresa_actividad})
- Centro: ${ctx.centro_nombre}
- Proceso: ${ctx.proceso_nombre} (${ctx.proceso_tipo})
- Actividad: ${ctx.actividad}
- Descripción: ${ctx.descripcion_tarea}
- Puesto: ${ctx.puesto_trabajo}
- Lugar: ${ctx.lugar_ejecucion}
- Equipos: ${ctx.equipos_involucrados}
- Materiales: ${ctx.materiales_sustancias}
- Trabajadores expuestos: ${ctx.n_trabajadores_total}
- ¿Rutinaria?: ${ctx.es_rutinaria ? 'Sí' : 'No'}

## Schema requerido (SugerenciaIA)
{
  peligro: string,
  riesgo: string,
  consecuenciaEsperada: string,
  factorRiesgo: "factor_humano" | "maquinas_herramientas" | "materias_primas" | "ambiente_trabajo",
  probabilidadSugerida: "baja" | "media" | "alta",
  consecuenciaSugerida: "ligeramente_danino" | "danino" | "extremadamente_danino",
  magnitudRiesgo: number,
  clasificacionRiesgo: "tolerable" | "moderado" | "importante" | "intolerable",
  jerarquiaControl: "eliminacion" | "sustitucion" | "ingenieria" | "administrativo" | "epp",
  medidasControl: [{ tipoControl, descripcion, responsableSugerido, plazoSugerido, requiereProgramaTrabajo }],
  normativaRelacionada: [{ norma, fundamento }],
  justificacionTecnica: string,
  nivelConfianza: "alta" | "media" | "baja"
}`
}

// ─── Función principal exportada ──────────────────────────────────────────────

export async function generarSugerenciaMiperConIA(
  contexto: ContextoTarea,
  modo: ModoIA = 'local',
): Promise<ResultadoIA> {
  switch (modo) {
    case 'externo': return ejecutarExterno(contexto)
    case 'hibrido': return ejecutarHibrido(contexto)
    default:        return ejecutarLocal(contexto)
  }
}
