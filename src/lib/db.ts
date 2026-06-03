// =============================================================
// APP MIPER · Capa de Servicios Supabase
// CRUD tipado para cada tabla — usado exclusivamente por app-store
// =============================================================

import { supabase } from './supabase'
import type {
  Empresa, CentroTrabajo, Proceso, Tarea,
  MiperRegistro, ProgramaTrabajo, IrlRegistro, PtsRegistro,
} from '../types'
import type { MiperSugerenciaIA, ContextoTarea, SugerenciaIA, EstadoRevisionIA } from '../types/ai'

// ─── Helper ──────────────────────────────────────────────────────────────────

async function run<T>(query: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await query
  if (error) throw error
  return data as T
}

// ─── Empresas ─────────────────────────────────────────────────────────────────

export const dbEmpresa = {
  getOwn: () =>
    run<Empresa[]>(supabase.from('empresas').select('*').order('created_at')),

  upsert: (data: Omit<Empresa, 'id'> & { id?: string }) =>
    run<Empresa>(
      supabase.from('empresas').upsert(data).select().single()
    ),

  delete: (id: string) =>
    run<null>(supabase.from('empresas').delete().eq('id', id)),
}

// ─── Centros de Trabajo ───────────────────────────────────────────────────────

export const dbCentro = {
  getByEmpresa: (empresa_id: string) =>
    run<CentroTrabajo[]>(
      supabase.from('centros_trabajo').select('*').eq('empresa_id', empresa_id)
    ),

  upsert: (data: Omit<CentroTrabajo, 'id'> & { id?: string }) =>
    run<CentroTrabajo>(
      supabase.from('centros_trabajo').upsert(data).select().single()
    ),
}

// ─── Procesos ─────────────────────────────────────────────────────────────────

export const dbProceso = {
  getByCentro: (centro_id: string) =>
    run<Proceso[]>(
      supabase.from('procesos').select('*').eq('centro_trabajo_id', centro_id).order('created_at')
    ),

  insert: (data: Omit<Proceso, 'id'>) =>
    run<Proceso>(supabase.from('procesos').insert(data).select().single()),

  update: (id: string, data: Partial<Proceso>) =>
    run<Proceso>(supabase.from('procesos').update(data).eq('id', id).select().single()),

  delete: (id: string) =>
    run<null>(supabase.from('procesos').delete().eq('id', id)),
}

// ─── Tareas ───────────────────────────────────────────────────────────────────

export const dbTarea = {
  getByProceso: (proceso_id: string) =>
    run<Tarea[]>(
      supabase.from('tareas').select('*').eq('proceso_id', proceso_id).order('created_at')
    ),

  getAllForCentro: (procesoIds: string[]) =>
    procesoIds.length === 0
      ? Promise.resolve([] as Tarea[])
      : run<Tarea[]>(
          supabase.from('tareas').select('*').in('proceso_id', procesoIds).order('created_at')
        ),

  insert: (data: Omit<Tarea, 'id' | 'n_trabajadores_total'>) =>
    run<Tarea>(supabase.from('tareas').insert(data).select().single()),

  update: (id: string, data: Partial<Tarea>) =>
    run<Tarea>(supabase.from('tareas').update(data).eq('id', id).select().single()),

  delete: (id: string) =>
    run<null>(supabase.from('tareas').delete().eq('id', id)),
}

// ─── MIPER ────────────────────────────────────────────────────────────────────

// Los campos mr y clasificacion_riesgo son GENERATED en la DB — no se envían en INSERT/UPDATE
type MiperInsert = Omit<MiperRegistro, 'id' | 'mr' | 'clasificacion_riesgo'>
type MiperUpdate = Partial<MiperInsert>

export const dbMiper = {
  getAllForTareas: (tareaIds: string[]) =>
    tareaIds.length === 0
      ? Promise.resolve([] as MiperRegistro[])
      : run<MiperRegistro[]>(
          supabase.from('miper_registros').select('*').in('tarea_id', tareaIds).order('created_at')
        ),

  insert: (data: MiperInsert) =>
    run<MiperRegistro>(supabase.from('miper_registros').insert(data).select().single()),

  update: (id: string, data: MiperUpdate) =>
    run<MiperRegistro>(
      supabase.from('miper_registros').update(data).eq('id', id).select().single()
    ),

  delete: (id: string) =>
    run<null>(supabase.from('miper_registros').delete().eq('id', id)),
}

// ─── Sugerencias IA ───────────────────────────────────────────────────────────

type SugerenciaInsert = {
  tarea_id:        string
  miper_id?:       string
  modo_ia:         string
  contexto_json:   ContextoTarea
  sugerencia_json: SugerenciaIA
}

export const dbSugerenciaIA = {
  getByTarea: (tarea_id: string) =>
    run<MiperSugerenciaIA[]>(
      supabase
        .from('miper_sugerencias_ia')
        .select('*')
        .eq('tarea_id', tarea_id)
        .order('fecha_generacion', { ascending: false })
    ),

  insert: (data: SugerenciaInsert) =>
    run<MiperSugerenciaIA>(
      supabase.from('miper_sugerencias_ia').insert(data).select().single()
    ),

  actualizarEstado: (
    id: string,
    estado: EstadoRevisionIA,
    opts?: { miper_id?: string; aprobado_por?: string; observacion_usuario?: string }
  ) =>
    run<MiperSugerenciaIA>(
      supabase
        .from('miper_sugerencias_ia')
        .update({
          estado_revision:     estado,
          fecha_revision:      new Date().toISOString(),
          miper_id:            opts?.miper_id,
          aprobado_por:        opts?.aprobado_por,
          observacion_usuario: opts?.observacion_usuario,
        })
        .eq('id', id)
        .select()
        .single()
    ),
}

// ─── Programa de Trabajo ──────────────────────────────────────────────────────

export const dbPrograma = {
  getByMiperIds: (miperIds: string[]) =>
    miperIds.length === 0
      ? Promise.resolve([] as ProgramaTrabajo[])
      : run<ProgramaTrabajo[]>(
          supabase.from('programa_trabajo').select('*').in('miper_id', miperIds).order('numero_programa')
        ),

  getByMiperId: (miper_id: string) =>
    run<ProgramaTrabajo | null>(
      supabase.from('programa_trabajo').select('*').eq('miper_id', miper_id).maybeSingle()
    ),

  update: (id: string, data: Partial<ProgramaTrabajo>) =>
    run<ProgramaTrabajo>(
      supabase.from('programa_trabajo').update(data).eq('id', id).select().single()
    ),
}

// ─── IRL — Información de Riesgos Laborales ───────────────────────────────────

type IrlInsert = Omit<IrlRegistro, 'id' | 'created_at'>
type IrlUpdate = Partial<IrlInsert>

export const dbIrl = {
  getByTareaIds: (tareaIds: string[]) =>
    tareaIds.length === 0
      ? Promise.resolve([] as IrlRegistro[])
      : run<IrlRegistro[]>(
          supabase
            .from('irl_registros')
            .select('*')
            .in('tarea_id', tareaIds)
            .order('created_at', { ascending: false })
        ),

  insert: (data: IrlInsert) =>
    run<IrlRegistro>(supabase.from('irl_registros').insert(data).select().single()),

  update: (id: string, data: IrlUpdate) =>
    run<IrlRegistro>(supabase.from('irl_registros').update(data).eq('id', id).select().single()),

  delete: (id: string) =>
    run<null>(supabase.from('irl_registros').delete().eq('id', id)),
}

// ─── PTS — Procedimiento de Trabajo Seguro ────────────────────────────────────

type PtsInsert = Omit<PtsRegistro, 'id' | 'created_at'>
type PtsUpdate = Partial<PtsInsert>

export const dbPts = {
  getByTareaIds: (tareaIds: string[]) =>
    tareaIds.length === 0
      ? Promise.resolve([] as PtsRegistro[])
      : run<PtsRegistro[]>(
          supabase
            .from('pts_registros')
            .select('*')
            .in('tarea_id', tareaIds)
            .order('created_at', { ascending: false })
        ),

  insert: (data: PtsInsert) =>
    run<PtsRegistro>(supabase.from('pts_registros').insert(data).select().single()),

  update: (id: string, data: PtsUpdate) =>
    run<PtsRegistro>(supabase.from('pts_registros').update(data).eq('id', id).select().single()),

  delete: (id: string) =>
    run<null>(supabase.from('pts_registros').delete().eq('id', id)),
}
