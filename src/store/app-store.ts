'use client'

import { create } from 'zustand'
import type {
  Empresa, CentroTrabajo, Proceso, Tarea,
  MiperRegistro, ProgramaTrabajo, EstadoPrograma, IrlRegistro, PtsRegistro,
} from '../types'
import {
  dbEmpresa, dbCentro, dbProceso, dbTarea, dbMiper, dbPrograma, dbIrl, dbPts,
} from '../lib/db'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function determinarEstado(item: ProgramaTrabajo): EstadoPrograma {
  if (item.fecha_ejecucion_efectiva) return 'completado'
  if (!item.fecha_ejecucion_programada) return 'pendiente'
  return new Date() > new Date(item.fecha_ejecucion_programada) ? 'vencido' : 'en_proceso'
}

// ─── State shape ─────────────────────────────────────────────────────────────

interface State {
  empresa:         Empresa | null
  centro:          CentroTrabajo | null
  procesos:        Proceso[]
  tareas:          Tarea[]
  miperRegistros:  MiperRegistro[]
  programaTrabajo: ProgramaTrabajo[]
  irlRegistros:    IrlRegistro[]
  ptsRegistros:    PtsRegistro[]
  inicializado:    boolean
  cargando:        boolean
  error:           string | null
}

interface Actions {
  // Bootstrap
  inicializar:  () => Promise<void>
  limpiarError: () => void

  // Empresa / Centro
  guardarEmpresa: (e: Omit<Empresa, 'id'> & { id?: string }) => Promise<void>
  guardarCentro:  (c: Omit<CentroTrabajo, 'id'> & { id?: string }) => Promise<void>

  // Módulo 1
  addProceso:    (p: Omit<Proceso, 'id'>) => Promise<string>
  updateProceso: (id: string, p: Partial<Proceso>) => Promise<void>
  removeProceso: (id: string) => Promise<void>
  addTarea:      (t: Omit<Tarea, 'id' | 'n_trabajadores_total'>) => Promise<string>
  updateTarea:   (id: string, t: Partial<Tarea>) => Promise<void>
  removeTarea:   (id: string) => Promise<void>

  // Módulo 2
  addMiper:    (m: Omit<MiperRegistro, 'id' | 'mr' | 'clasificacion_riesgo'>) => Promise<MiperRegistro>
  updateMiper: (id: string, m: Partial<Omit<MiperRegistro, 'id' | 'mr' | 'clasificacion_riesgo'>>) => Promise<void>
  removeMiper: (id: string) => Promise<void>

  // Módulo 3
  updatePrograma:   (id: string, p: Partial<ProgramaTrabajo>) => Promise<void>
  marcarCompletado: (id: string, fecha: string) => Promise<void>
  recomputarEstados: () => void

  // Módulo 4: IRL
  addIrl:    (data: Omit<IrlRegistro, 'id' | 'created_at'>) => Promise<IrlRegistro>
  updateIrl: (id: string, data: Partial<Omit<IrlRegistro, 'id' | 'created_at'>>) => Promise<void>
  removeIrl: (id: string) => Promise<void>

  // Módulo 5: PTS
  addPts:    (data: Omit<PtsRegistro, 'id' | 'created_at'>) => Promise<PtsRegistro>
  updatePts: (id: string, data: Partial<Omit<PtsRegistro, 'id' | 'created_at'>>) => Promise<void>
  removePts: (id: string) => Promise<void>

  // Selectores
  tareasByProceso: (procesoId: string) => Tarea[]
  miperByTarea:    (tareaId: string) => MiperRegistro[]
  procesoByTarea:  (tareaId: string) => Proceso | undefined
  irlByTarea:      (tareaId: string) => IrlRegistro[]
  ptsByTarea:      (tareaId: string) => PtsRegistro[]
}

type AppStore = State & Actions

// ─── Store ───────────────────────────────────────────────────────────────────

const INITIAL: State = {
  empresa:         null,
  centro:          null,
  procesos:        [],
  tareas:          [],
  miperRegistros:  [],
  programaTrabajo: [],
  irlRegistros:    [],
  ptsRegistros:    [],
  inicializado:    false,
  cargando:        false,
  error:           null,
}

export const useAppStore = create<AppStore>()((set, get) => ({
  ...INITIAL,

  limpiarError: () => set({ error: null }),

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  inicializar: async () => {
    if (get().inicializado) return
    set({ cargando: true, error: null })
    try {
      // 1. Empresa → Centro (secuencial: cada uno necesita el ID anterior)
      const empresas = await dbEmpresa.getOwn()
      const empresa  = empresas[0] ?? null
      if (!empresa) {
        set({ empresa: null, centro: null, inicializado: true, cargando: false })
        return
      }

      const centros = await dbCentro.getByEmpresa(empresa.id)
      const centro  = centros[0] ?? null
      if (!centro) {
        set({ empresa, centro: null, inicializado: true, cargando: false })
        return
      }

      // 2. Procesos → Tareas (secuencial: tareas necesita procesoIds)
      const procesos   = await dbProceso.getByCentro(centro.id)
      const procesoIds = procesos.map(p => p.id)
      const tareas     = await dbTarea.getAllForCentro(procesoIds)
      const tareaIds   = tareas.map(t => t.id)

      // 3. MIPER + IRL + PTS en paralelo (los tres solo necesitan tareaIds)
      const [miperRegistros, irlRegistros, ptsRegistros] = await Promise.all([
        dbMiper.getAllForTareas(tareaIds),
        dbIrl.getByTareaIds(tareaIds).catch(() => [] as IrlRegistro[]),
        dbPts.getByTareaIds(tareaIds).catch(() => [] as PtsRegistro[]),
      ])

      // 4. Programa de trabajo (necesita miperIds)
      const miperIds       = miperRegistros.map(m => m.id)
      const programaTrabajo = await dbPrograma.getByMiperIds(miperIds)

      set({
        empresa,
        centro,
        procesos,
        tareas,
        miperRegistros,
        programaTrabajo: programaTrabajo.map(pt => ({ ...pt, estado: determinarEstado(pt) })),
        irlRegistros,
        ptsRegistros,
        inicializado: true,
        cargando:     false,
      })
    } catch (err) {
      set({ error: (err as Error).message, cargando: false })
    }
  },

  // ── Empresa / Centro ──────────────────────────────────────────────────────

  guardarEmpresa: async (data) => {
    set({ cargando: true, error: null })
    try {
      const empresa = await dbEmpresa.upsert(data)
      set({ empresa, cargando: false })
    } catch (err) {
      set({ error: (err as Error).message, cargando: false })
      throw err
    }
  },

  guardarCentro: async (data) => {
    set({ cargando: true, error: null })
    try {
      const centro = await dbCentro.upsert(data)
      set({ centro, cargando: false })
    } catch (err) {
      set({ error: (err as Error).message, cargando: false })
      throw err
    }
  },

  // ── Módulo 1 ──────────────────────────────────────────────────────────────

  addProceso: async (data) => {
    const optimisticId = crypto.randomUUID()
    const optimistic: Proceso = { ...data, id: optimisticId }
    set(s => ({ procesos: [...s.procesos, optimistic] }))
    try {
      const saved = await dbProceso.insert(data)
      set(s => ({ procesos: s.procesos.map(p => p.id === optimisticId ? saved : p) }))
      return saved.id
    } catch (err) {
      set(s => ({ procesos: s.procesos.filter(p => p.id !== optimisticId), error: (err as Error).message }))
      throw err
    }
  },

  updateProceso: async (id, data) => {
    const prev = get().procesos.find(p => p.id === id)
    set(s => ({ procesos: s.procesos.map(p => p.id === id ? { ...p, ...data } : p) }))
    try {
      await dbProceso.update(id, data)
    } catch (err) {
      if (prev) set(s => ({ procesos: s.procesos.map(p => p.id === id ? prev : p) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  removeProceso: async (id) => {
    const { procesos, tareas, miperRegistros, programaTrabajo } = get()
    const tareaIds = tareas.filter(t => t.proceso_id === id).map(t => t.id)
    const miperIds = miperRegistros.filter(m => tareaIds.includes(m.tarea_id)).map(m => m.id)

    // Optimistic
    set({
      procesos:        procesos.filter(p => p.id !== id),
      tareas:          tareas.filter(t => t.proceso_id !== id),
      miperRegistros:  miperRegistros.filter(m => !tareaIds.includes(m.tarea_id)),
      programaTrabajo: programaTrabajo.filter(pt => !miperIds.includes(pt.miper_id)),
    })
    try {
      await dbProceso.delete(id)
    } catch (err) {
      set({ procesos, tareas, miperRegistros, programaTrabajo, error: (err as Error).message })
      throw err
    }
  },

  addTarea: async (data) => {
    const optimisticId = crypto.randomUUID()
    const optimistic: Tarea = { ...data, id: optimisticId }
    set(s => ({ tareas: [...s.tareas, optimistic] }))
    try {
      const saved = await dbTarea.insert(data)
      set(s => ({ tareas: s.tareas.map(t => t.id === optimisticId ? saved : t) }))
      return saved.id
    } catch (err) {
      set(s => ({ tareas: s.tareas.filter(t => t.id !== optimisticId), error: (err as Error).message }))
      throw err
    }
  },

  updateTarea: async (id, data) => {
    const prev = get().tareas.find(t => t.id === id)
    set(s => ({ tareas: s.tareas.map(t => t.id === id ? { ...t, ...data } : t) }))
    try {
      await dbTarea.update(id, data)
    } catch (err) {
      if (prev) set(s => ({ tareas: s.tareas.map(t => t.id === id ? prev : t) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  removeTarea: async (id) => {
    const { tareas, miperRegistros, programaTrabajo } = get()
    const miperIds = miperRegistros.filter(m => m.tarea_id === id).map(m => m.id)

    set({
      tareas:          tareas.filter(t => t.id !== id),
      miperRegistros:  miperRegistros.filter(m => m.tarea_id !== id),
      programaTrabajo: programaTrabajo.filter(pt => !miperIds.includes(pt.miper_id)),
    })
    try {
      await dbTarea.delete(id)
    } catch (err) {
      set({ tareas, miperRegistros, programaTrabajo, error: (err as Error).message })
      throw err
    }
  },

  // ── Módulo 2 ──────────────────────────────────────────────────────────────

  addMiper: async (data) => {
    const saved = await dbMiper.insert(data)
    set(s => ({ miperRegistros: [...s.miperRegistros, saved] }))

    // El trigger fn_derivar_a_programa crea la fila en programa_trabajo automáticamente
    if (saved.medida_control?.trim()) {
      try {
        const pt = await dbPrograma.getByMiperId(saved.id)
        if (pt) {
          set(s => ({
            programaTrabajo: [
              ...s.programaTrabajo,
              { ...pt, estado: determinarEstado(pt) },
            ],
          }))
        }
      } catch {
        // silenciar: el programa puede cargarse en la próxima inicializar()
      }
    }

    return saved
  },

  updateMiper: async (id, changes) => {
    const prev = get().miperRegistros.find(m => m.id === id)
    set(s => ({
      miperRegistros: s.miperRegistros.map(m => m.id === id ? { ...m, ...changes } : m),
    }))
    try {
      const saved = await dbMiper.update(id, changes)
      // Actualizar con valores calculados devueltos por la DB (mr, clasificacion_riesgo)
      set(s => ({
        miperRegistros: s.miperRegistros.map(m => m.id === id ? saved : m),
      }))

      // Sincronizar campos al programa
      const needsSync = changes.medida_control !== undefined
        || changes.responsable_control !== undefined
        || changes.plazo_control !== undefined

      if (needsSync) {
        set(s => ({
          programaTrabajo: s.programaTrabajo.map(pt => {
            if (pt.miper_id !== id) return pt
            return {
              ...pt,
              actividad_medida_control:   changes.medida_control ?? pt.actividad_medida_control,
              responsable:                changes.responsable_control ?? pt.responsable,
              fecha_ejecucion_programada: changes.plazo_control ?? pt.fecha_ejecucion_programada,
            }
          }),
        }))
      }
    } catch (err) {
      if (prev) set(s => ({ miperRegistros: s.miperRegistros.map(m => m.id === id ? prev : m) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  removeMiper: async (id) => {
    const { miperRegistros, programaTrabajo } = get()
    set({
      miperRegistros:  miperRegistros.filter(m => m.id !== id),
      programaTrabajo: programaTrabajo.filter(pt => pt.miper_id !== id),
    })
    try {
      await dbMiper.delete(id)
    } catch (err) {
      set({ miperRegistros, programaTrabajo, error: (err as Error).message })
      throw err
    }
  },

  // ── Módulo 3 ──────────────────────────────────────────────────────────────

  updatePrograma: async (id, changes) => {
    const prev = get().programaTrabajo.find(pt => pt.id === id)
    set(s => ({
      programaTrabajo: s.programaTrabajo.map(pt => {
        if (pt.id !== id) return pt
        const updated = { ...pt, ...changes }
        return { ...updated, estado: determinarEstado(updated) }
      }),
    }))
    try {
      await dbPrograma.update(id, changes)
    } catch (err) {
      if (prev) set(s => ({ programaTrabajo: s.programaTrabajo.map(pt => pt.id === id ? prev : pt) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  marcarCompletado: async (id, fecha) => {
    const changes = { fecha_ejecucion_efectiva: fecha, porcentaje_avance: 100 }
    const prev = get().programaTrabajo.find(pt => pt.id === id)
    set(s => ({
      programaTrabajo: s.programaTrabajo.map(pt =>
        pt.id === id ? { ...pt, ...changes, estado: 'completado' } : pt
      ),
    }))
    try {
      await dbPrograma.update(id, changes)
    } catch (err) {
      if (prev) set(s => ({ programaTrabajo: s.programaTrabajo.map(pt => pt.id === id ? prev : pt) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  recomputarEstados: () =>
    set(s => ({
      programaTrabajo: s.programaTrabajo.map(pt => ({
        ...pt,
        estado: determinarEstado(pt),
      })),
    })),

  // ── Módulo 4: IRL ─────────────────────────────────────────────────────────

  addIrl: async (data) => {
    try {
      const saved = await dbIrl.insert(data)
      set(s => ({ irlRegistros: [saved, ...s.irlRegistros] }))
      return saved
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  updateIrl: async (id, changes) => {
    const prev = get().irlRegistros.find(r => r.id === id)
    set(s => ({ irlRegistros: s.irlRegistros.map(r => r.id === id ? { ...r, ...changes } : r) }))
    try {
      const saved = await dbIrl.update(id, changes)
      set(s => ({ irlRegistros: s.irlRegistros.map(r => r.id === id ? saved : r) }))
    } catch (err) {
      if (prev) set(s => ({ irlRegistros: s.irlRegistros.map(r => r.id === id ? prev : r) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  removeIrl: async (id) => {
    const prev = get().irlRegistros
    set(s => ({ irlRegistros: s.irlRegistros.filter(r => r.id !== id) }))
    try {
      await dbIrl.delete(id)
    } catch (err) {
      set({ irlRegistros: prev, error: (err as Error).message })
      throw err
    }
  },

  // ── Selectores ────────────────────────────────────────────────────────────

  tareasByProceso: (procesoId) =>
    get().tareas.filter(t => t.proceso_id === procesoId),

  miperByTarea: (tareaId) =>
    get().miperRegistros.filter(m => m.tarea_id === tareaId),

  procesoByTarea: (tareaId) => {
    const tarea = get().tareas.find(t => t.id === tareaId)
    return tarea ? get().procesos.find(p => p.id === tarea.proceso_id) : undefined
  },

  irlByTarea: (tareaId) =>
    get().irlRegistros.filter(r => r.tarea_id === tareaId),

  // ── Módulo 5: PTS ─────────────────────────────────────────────────────────

  addPts: async (data) => {
    try {
      const saved = await dbPts.insert(data)
      set(s => ({ ptsRegistros: [saved, ...s.ptsRegistros] }))
      return saved
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  updatePts: async (id, changes) => {
    const prev = get().ptsRegistros.find(r => r.id === id)
    set(s => ({ ptsRegistros: s.ptsRegistros.map(r => r.id === id ? { ...r, ...changes } : r) }))
    try {
      const saved = await dbPts.update(id, changes)
      set(s => ({ ptsRegistros: s.ptsRegistros.map(r => r.id === id ? saved : r) }))
    } catch (err) {
      if (prev) set(s => ({ ptsRegistros: s.ptsRegistros.map(r => r.id === id ? prev : r) }))
      set({ error: (err as Error).message })
      throw err
    }
  },

  removePts: async (id) => {
    const prev = get().ptsRegistros
    set(s => ({ ptsRegistros: s.ptsRegistros.filter(r => r.id !== id) }))
    try {
      await dbPts.delete(id)
    } catch (err) {
      set({ ptsRegistros: prev, error: (err as Error).message })
      throw err
    }
  },

  ptsByTarea: (tareaId) =>
    get().ptsRegistros.filter(r => r.tarea_id === tareaId),
}))
