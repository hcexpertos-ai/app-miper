'use client'

// =============================================================
// APP MIPER · Componente AsistenteIA
// Panel IA Predictivo para el formulario MIPER
// =============================================================

import { useState, useCallback } from 'react'
import type { ContextoTarea, SugerenciaIA, NivelConfianza } from '../types/ai'
import {
  LABEL_FACTOR_RIESGO,
  LABEL_CONFIANZA,
  COLOR_CONFIANZA,
} from '../types/ai'
import { generarSugerenciaMiperConIA } from '../lib/ai/miper-ai-service'
import type { ModoIA } from '../types/ai'

// ─── Labels locales ───────────────────────────────────────────────────────────

const LABEL_TIPO_CONTROL: Record<string, string> = {
  eliminacion:    'Eliminación',
  sustitucion:    'Sustitución',
  ingenieria:     'Ingeniería',
  administrativo: 'Administrativo',
  epp:            'EPP',
}

const LABEL_PROBABILIDAD: Record<string, string> = {
  baja:  'Baja',
  media: 'Media',
  alta:  'Alta',
}

const LABEL_CONSECUENCIA: Record<string, string> = {
  ligeramente_danino:    'Ligeramente Dañino',
  danino:                'Dañino',
  extremadamente_danino: 'Extremadamente Dañino',
}

const COLOR_CLASIFICACION: Record<string, string> = {
  tolerable:    'bg-green-100 text-green-800 border border-green-300',
  moderado:     'bg-yellow-100 text-yellow-800 border border-yellow-300',
  importante:   'bg-orange-100 text-orange-800 border border-orange-300',
  intolerable:  'bg-red-100 text-red-800 border border-red-300',
}

const LABEL_CLASIFICACION: Record<string, string> = {
  tolerable:   'TOLERABLE',
  moderado:    'MODERADO',
  importante:  'IMPORTANTE',
  intolerable: 'INTOLERABLE',
}

// ─── Tipos del componente ─────────────────────────────────────────────────────

type EstadoPanel = 'idle' | 'cargando' | 'sugerida' | 'error'

export interface CamposAceptados {
  peligro:              string
  riesgo:               string
  dano_probable:        string
  factor_riesgo:        string
  probabilidad:         string
  consecuencia:         string
  tipo_control:         string
  medida_control:       string
  responsable_control:  string
  plazo_control:        string
}

interface Props {
  contexto:      ContextoTarea
  modo?:         ModoIA
  onAceptar:     (campos: CamposAceptados, sugerencia: SugerenciaIA) => void
  onDescartar?:  () => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AsistenteIA({
  contexto,
  modo = 'local',
  onAceptar,
  onDescartar,
}: Props) {
  const [estado,      setEstado]      = useState<EstadoPanel>('idle')
  const [sugerencias, setSugerencias] = useState<SugerenciaIA[]>([])
  const [indexActual, setIndexActual] = useState(0)
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null)
  const [duracionMs,  setDuracionMs]  = useState<number | null>(null)

  const sugerencia = sugerencias[indexActual] ?? null

  // ── Generar sugerencia ─────────────────────────────────────────────────────

  const generar = useCallback(async () => {
    setEstado('cargando')
    setErrorMsg(null)
    try {
      const resultado = await generarSugerenciaMiperConIA(contexto, modo)
      if (resultado.sugerencias.length === 0) {
        setEstado('error')
        setErrorMsg('No se encontraron sugerencias para este contexto. Intenta con más detalles en la descripción de la tarea.')
        return
      }
      setSugerencias(resultado.sugerencias)
      setIndexActual(0)
      setDuracionMs(resultado.duracionMs)
      setEstado('sugerida')
    } catch (err) {
      setEstado('error')
      setErrorMsg((err as Error).message ?? 'Error desconocido al generar sugerencia.')
    }
  }, [contexto, modo])

  // ── Aceptar sugerencia actual ─────────────────────────────────────────────

  const handleAceptar = useCallback(() => {
    if (!sugerencia) return
    const medidaPrincipal = sugerencia.medidasControl[0]
    const campos: CamposAceptados = {
      peligro:             sugerencia.peligro,
      riesgo:              sugerencia.riesgo,
      dano_probable:       sugerencia.consecuenciaEsperada,
      factor_riesgo:       sugerencia.factorRiesgo,
      probabilidad:        sugerencia.probabilidadSugerida,
      consecuencia:        sugerencia.consecuenciaSugerida,
      tipo_control:        medidaPrincipal?.tipoControl ?? sugerencia.jerarquiaControl,
      medida_control:      medidaPrincipal?.descripcion ?? '',
      responsable_control: medidaPrincipal?.responsableSugerido ?? '',
      plazo_control:       '',   // fecha real la pone el usuario
    }
    onAceptar(campos, sugerencia)
    setEstado('idle')
    setSugerencias([])
  }, [sugerencia, onAceptar])

  // ── Rotar entre sugerencias disponibles ───────────────────────────────────

  const siguienteSugerencia = useCallback(() => {
    if (sugerencias.length > 1) {
      setIndexActual(i => (i + 1) % sugerencias.length)
    } else {
      // solo hay 1 o necesitamos regenerar
      generar()
    }
  }, [sugerencias, generar])

  const handleDescartar = useCallback(() => {
    setEstado('idle')
    setSugerencias([])
    setErrorMsg(null)
    onDescartar?.()
  }, [onDescartar])

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm overflow-hidden">

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white">
        <span className="text-xl">🤖</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight">Asistente IA Preventivo</h3>
          <p className="text-indigo-200 text-xs truncate">Motor de reglas DS 44 · Ley 16.744 · DS 594</p>
        </div>
        {duracionMs !== null && estado === 'sugerida' && (
          <span className="text-indigo-200 text-xs whitespace-nowrap">{duracionMs} ms</span>
        )}
        <ModoChip modo={modo} />
      </div>

      {/* ── Resumen de contexto ──────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
        <p className="text-xs text-indigo-700 leading-relaxed">
          <span className="font-medium">Tarea analizada:</span>{' '}
          {contexto.descripcion_tarea || contexto.actividad}
          {contexto.lugar_ejecucion ? ` · ${contexto.lugar_ejecucion}` : ''}
          {contexto.puesto_trabajo   ? ` · ${contexto.puesto_trabajo}` : ''}
        </p>
      </div>

      {/* ── Cuerpo ──────────────────────────────────────────────────────────── */}
      <div className="p-4 space-y-4">

        {/* Estado: idle */}
        {estado === 'idle' && (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-gray-600">
              Analiza automáticamente el contexto de la tarea para sugerir peligros, riesgos, evaluación y medidas de control según normativa chilena.
            </p>
            <button
              onClick={generar}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <span>✨</span> Sugerir con IA
            </button>
          </div>
        )}

        {/* Estado: cargando */}
        {estado === 'cargando' && (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center gap-3 text-indigo-700">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span className="text-sm font-medium">Analizando contexto de la tarea…</span>
            </div>
            <p className="text-xs text-gray-500">Consultando biblioteca de reglas preventivas</p>
          </div>
        )}

        {/* Estado: error */}
        {estado === 'error' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generar}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={handleDescartar}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Estado: sugerida */}
        {estado === 'sugerida' && sugerencia && (
          <div className="space-y-3">

            {/* Indicador de múltiples sugerencias */}
            {sugerencias.length > 1 && (
              <div className="flex items-center justify-between text-xs text-indigo-600 font-medium">
                <span>Sugerencia {indexActual + 1} de {sugerencias.length}</span>
                <div className="flex gap-1">
                  {sugerencias.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndexActual(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i === indexActual ? 'bg-indigo-600' : 'bg-indigo-200 hover:bg-indigo-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Card de confianza + factor */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR_CONFIANZA[sugerencia.nivelConfianza as NivelConfianza]}`}>
                {LABEL_CONFIANZA[sugerencia.nivelConfianza as NivelConfianza]}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                {LABEL_FACTOR_RIESGO[sugerencia.factorRiesgo]}
              </span>
            </div>

            {/* Peligro / Riesgo / Daño */}
            <SectionCard titulo="Identificación del Peligro">
              <RowItem label="Peligro"    value={sugerencia.peligro} />
              <RowItem label="Riesgo"     value={sugerencia.riesgo} />
              <RowItem label="Consecuencia esperada" value={sugerencia.consecuenciaEsperada} />
            </SectionCard>

            {/* Evaluación P × C → MR */}
            <SectionCard titulo="Evaluación de Riesgo (P × C)">
              <div className="grid grid-cols-3 gap-2 text-center">
                <EvalCell label="Probabilidad" value={LABEL_PROBABILIDAD[sugerencia.probabilidadSugerida]} />
                <EvalCell label="Consecuencia" value={LABEL_CONSECUENCIA[sugerencia.consecuenciaSugerida]} />
                <div className="rounded-lg p-2 bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">MR</p>
                  <p className="text-lg font-bold text-gray-800">{sugerencia.magnitudRiesgo}</p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${COLOR_CLASIFICACION[sugerencia.clasificacionRiesgo]}`}>
                    {LABEL_CLASIFICACION[sugerencia.clasificacionRiesgo]}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Jerarquía de controles */}
            <SectionCard titulo="Jerarquía de Control Sugerida">
              <div className="flex items-center gap-2 mb-2">
                <JerarquiaSteps actual={sugerencia.jerarquiaControl} />
              </div>
              <div className="space-y-2">
                {sugerencia.medidasControl.map((m, i) => (
                  <div key={i} className="rounded-lg bg-white border border-gray-200 p-2.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        {LABEL_TIPO_CONTROL[m.tipoControl]}
                      </span>
                      {m.requiereProgramaTrabajo && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                          Requiere PT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700">{m.descripcion}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>👤 {m.responsableSugerido}</span>
                      <span>⏱ {m.plazoSugerido}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Normativa */}
            {sugerencia.normativaRelacionada.length > 0 && (
              <SectionCard titulo="Normativa Aplicable">
                <div className="space-y-1.5">
                  {sugerencia.normativaRelacionada.map((n, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="font-semibold text-indigo-700 whitespace-nowrap">{n.norma}</span>
                      <span className="text-gray-600">{n.fundamento}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Justificación técnica */}
            <SectionCard titulo="Justificación Técnica">
              <p className="text-xs text-gray-700 leading-relaxed">{sugerencia.justificacionTecnica}</p>
            </SectionCard>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleAceptar}
                className="col-span-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <span>✅</span> Aceptar y completar formulario
              </button>
              <button
                onClick={siguienteSugerencia}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-medium py-2 rounded-lg border border-indigo-300 transition-colors"
              >
                <span>🔄</span>
                {sugerencias.length > 1 ? 'Siguiente sugerencia' : 'Generar nueva'}
              </button>
              <button
                onClick={handleDescartar}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-red-50 text-red-600 text-sm font-medium py-2 rounded-lg border border-red-200 transition-colors"
              >
                <span>✕</span> Descartar
              </button>
            </div>

            {/* Disclaimer */}
            <Disclaimer />
          </div>
        )}

        {/* Disclaimer en idle también */}
        {estado === 'idle' && <Disclaimer compact />}

      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ModoChip({ modo }: { modo: ModoIA }) {
  const labels: Record<ModoIA, string> = { local: 'Offline', externo: 'API', hibrido: 'Híbrido' }
  const colors: Record<ModoIA, string> = {
    local:   'bg-indigo-500 text-indigo-100',
    externo: 'bg-purple-500 text-purple-100',
    hibrido: 'bg-violet-500 text-violet-100',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors[modo]}`}>
      {labels[modo]}
    </span>
  )
}

function SectionCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white border border-indigo-100 shadow-sm overflow-hidden">
      <div className="px-3 py-1.5 bg-indigo-50 border-b border-indigo-100">
        <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">{titulo}</h4>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="font-medium text-gray-500 w-28 shrink-0">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  )
}

function EvalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2 bg-gray-50 border border-gray-200">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xs font-semibold text-gray-800">{value}</p>
    </div>
  )
}

const JERARQUIA_ORDEN = ['eliminacion', 'sustitucion', 'ingenieria', 'administrativo', 'epp']
const JERARQUIA_ICONS: Record<string, string> = {
  eliminacion:    '🚫',
  sustitucion:    '🔄',
  ingenieria:     '🔧',
  administrativo: '📋',
  epp:            '🦺',
}

function JerarquiaSteps({ actual }: { actual: string }) {
  const idx = JERARQUIA_ORDEN.indexOf(actual)
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {JERARQUIA_ORDEN.map((j, i) => (
        <div key={j} className="flex items-center gap-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
              i === idx
                ? 'bg-indigo-600 text-white'
                : i < idx
                ? 'bg-gray-100 text-gray-400 line-through'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {JERARQUIA_ICONS[j]} {LABEL_TIPO_CONTROL[j]}
          </span>
          {i < JERARQUIA_ORDEN.length - 1 && (
            <span className="text-gray-300 text-xs">›</span>
          )}
        </div>
      ))}
    </div>
  )
}

function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-lg bg-amber-50 border border-amber-200 ${compact ? 'p-2' : 'p-3'}`}>
      <p className={`text-amber-800 ${compact ? 'text-xs' : 'text-xs'} leading-relaxed`}>
        <span className="font-semibold">⚠️ Aviso importante:</span>{' '}
        Las sugerencias generadas por IA son referenciales y deben ser revisadas y validadas
        por un profesional competente en prevención de riesgos antes de su aprobación y uso documental.
      </p>
    </div>
  )
}
