-- =============================================================
-- APP MIPER · Migración: campo observaciones en tareas
-- Agrega columna observaciones para el informe de levantamiento DS 44
-- =============================================================

ALTER TABLE tareas
  ADD COLUMN IF NOT EXISTS observaciones TEXT NOT NULL DEFAULT '';

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tareas' AND column_name = 'observaciones';
