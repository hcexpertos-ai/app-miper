-- =============================================================
-- APP MIPER · Row Level Security (RLS)
-- Cada usuario solo ve y edita sus propios datos
-- Ejecutar DESPUÉS de schema.sql en Supabase SQL Editor
-- =============================================================

-- ─── Agregar user_id a empresas ──────────────────────────────

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Asignar user_id en inserts futuros usando auth.uid()
ALTER TABLE empresas
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ─── Políticas: empresas ──────────────────────────────────────

DROP POLICY IF EXISTS "own_empresa_select" ON empresas;
DROP POLICY IF EXISTS "own_empresa_insert" ON empresas;
DROP POLICY IF EXISTS "own_empresa_update" ON empresas;
DROP POLICY IF EXISTS "own_empresa_delete" ON empresas;

CREATE POLICY "own_empresa_select" ON empresas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_empresa_insert" ON empresas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_empresa_update" ON empresas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_empresa_delete" ON empresas FOR DELETE USING (auth.uid() = user_id);

-- ─── Helper: verificar que empresa pertenece al usuario ──────

CREATE OR REPLACE FUNCTION empresa_del_usuario(emp_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM empresas WHERE id = emp_id AND user_id = auth.uid()
  );
$$;

-- ─── Políticas: centros_trabajo ───────────────────────────────

DROP POLICY IF EXISTS "own_centro" ON centros_trabajo;
CREATE POLICY "own_centro" ON centros_trabajo
  FOR ALL USING (empresa_del_usuario(empresa_id));

-- ─── Políticas: procesos ──────────────────────────────────────

DROP POLICY IF EXISTS "own_proceso" ON procesos;
CREATE POLICY "own_proceso" ON procesos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM centros_trabajo ct
    WHERE ct.id = centro_trabajo_id AND empresa_del_usuario(ct.empresa_id)
  )
);

-- ─── Políticas: tareas ────────────────────────────────────────

DROP POLICY IF EXISTS "own_tarea" ON tareas;
CREATE POLICY "own_tarea" ON tareas FOR ALL USING (
  EXISTS (
    SELECT 1 FROM procesos p
    JOIN centros_trabajo ct ON p.centro_trabajo_id = ct.id
    WHERE p.id = proceso_id AND empresa_del_usuario(ct.empresa_id)
  )
);

-- ─── Políticas: miper_registros ───────────────────────────────

DROP POLICY IF EXISTS "own_miper" ON miper_registros;
CREATE POLICY "own_miper" ON miper_registros FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tareas t
    JOIN procesos p ON t.proceso_id = p.id
    JOIN centros_trabajo ct ON p.centro_trabajo_id = ct.id
    WHERE t.id = tarea_id AND empresa_del_usuario(ct.empresa_id)
  )
);

-- ─── Políticas: programa_trabajo ─────────────────────────────

DROP POLICY IF EXISTS "own_programa" ON programa_trabajo;
CREATE POLICY "own_programa" ON programa_trabajo FOR ALL USING (
  EXISTS (
    SELECT 1 FROM miper_registros m
    JOIN tareas t ON m.tarea_id = t.id
    JOIN procesos p ON t.proceso_id = p.id
    JOIN centros_trabajo ct ON p.centro_trabajo_id = ct.id
    WHERE m.id = miper_id AND empresa_del_usuario(ct.empresa_id)
  )
);

-- ─── Verificar que RLS está activado en todas las tablas ─────

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['empresas','centros_trabajo','procesos','tareas','miper_registros','programa_trabajo']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    RAISE NOTICE 'RLS habilitado en %', t;
  END LOOP;
END $$;
