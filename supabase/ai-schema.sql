-- =============================================================
-- APP MIPER · Schema IA Predictiva
-- Tabla para persistir sugerencias generadas por IA
-- Ejecutar en: Supabase → SQL Editor
-- =============================================================

-- ─── Enum para estado de revisión ────────────────────────────────────────────

CREATE TYPE estado_revision_ia_enum AS ENUM (
  'pendiente',
  'aceptada',
  'editada',
  'rechazada'
);

-- ─── Tabla principal de sugerencias ──────────────────────────────────────────

CREATE TABLE miper_sugerencias_ia (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia opcional al registro MIPER (NULL mientras no se guarda)
  miper_id             UUID REFERENCES miper_registros(id) ON DELETE SET NULL,

  -- Referencia a la tarea que origina la sugerencia (requerida)
  tarea_id             UUID NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,

  -- Modo de generación: local | externo | hibrido
  modo_ia              TEXT NOT NULL DEFAULT 'local'
                       CHECK (modo_ia IN ('local', 'externo', 'hibrido')),

  -- Contexto serializado enviado al motor IA
  contexto_json        JSONB NOT NULL,

  -- Sugerencia completa (SugerenciaIA) retornada por el motor
  sugerencia_json      JSONB NOT NULL,

  -- Flujo de revisión humana
  estado_revision      estado_revision_ia_enum NOT NULL DEFAULT 'pendiente',
  aprobado_por         TEXT,                            -- email o nombre del revisor
  observacion_usuario  TEXT,                            -- nota libre del revisor

  -- Timestamps
  fecha_generacion     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_revision       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Trigger updated_at ───────────────────────────────────────────────────────

CREATE TRIGGER trg_updated_at_sugerencias_ia
  BEFORE UPDATE ON miper_sugerencias_ia
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_sugerencias_tarea   ON miper_sugerencias_ia(tarea_id);
CREATE INDEX idx_sugerencias_miper   ON miper_sugerencias_ia(miper_id);
CREATE INDEX idx_sugerencias_estado  ON miper_sugerencias_ia(estado_revision);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE miper_sugerencias_ia ENABLE ROW LEVEL SECURITY;

-- Acceso solo a sugerencias de las propias tareas (via empresa → centro → proceso → tarea)
CREATE POLICY "sugerencias_ia_own"
  ON miper_sugerencias_ia
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM tareas t
      JOIN procesos p         ON p.id  = t.proceso_id
      JOIN centros_trabajo ct ON ct.id = p.centro_trabajo_id
      JOIN empresas e         ON e.id  = ct.empresa_id
      WHERE t.id = miper_sugerencias_ia.tarea_id
        AND e.user_id = auth.uid()
    )
  );

-- ─── Función: marcar revisión ─────────────────────────────────────────────────
-- Actualiza estado_revision, aprobado_por y fecha_revision en un solo paso

CREATE OR REPLACE FUNCTION fn_revisar_sugerencia_ia(
  p_id                UUID,
  p_estado            estado_revision_ia_enum,
  p_aprobado_por      TEXT DEFAULT NULL,
  p_observacion       TEXT DEFAULT NULL
)
RETURNS miper_sugerencias_ia LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result miper_sugerencias_ia;
BEGIN
  UPDATE miper_sugerencias_ia SET
    estado_revision     = p_estado,
    aprobado_por        = COALESCE(p_aprobado_por, aprobado_por),
    observacion_usuario = COALESCE(p_observacion, observacion_usuario),
    fecha_revision      = NOW(),
    updated_at          = NOW()
  WHERE id = p_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;
