-- =====================================================
-- TRAINING MODULE - ACTUALIZAR TABLAS EXISTENTES (CORREGIDO)
-- =====================================================

-- IMPORTANTE: Este script actualiza las tablas existentes para el Training Module
-- Tanto workout_sessions como exercise_sets ya existen pero necesitan ajustes

-- =====================================================
-- ACTUALIZAR TABLA WORKOUT_SESSIONS
-- =====================================================

-- Agregar columnas faltantes a workout_sessions
ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled'));

ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS routine_id UUID REFERENCES routines(id) ON DELETE SET NULL;

ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Cambiar total_duration_minutes a total_duration_seconds si no existe
ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS total_duration_seconds INTEGER DEFAULT 0;

-- Actualizar valores existentes (convertir minutos a segundos si es necesario)
UPDATE workout_sessions 
SET total_duration_seconds = COALESCE(total_duration_minutes * 60, 0)
WHERE total_duration_seconds IS NULL OR total_duration_seconds = 0;

-- Actualizar status para sesiones existentes
UPDATE workout_sessions 
SET status = CASE 
  WHEN completed_at IS NOT NULL THEN 'completed'
  ELSE 'active'
END
WHERE status IS NULL;

-- =====================================================
-- ACTUALIZAR TABLA EXERCISE_SETS (YA EXISTE)
-- =====================================================

-- La tabla exercise_sets ya existe, pero necesitamos agregar/modificar campos
-- NOTA: session_id ya existe y apunta a workout_sessions, lo usaremos como workout_session_id

-- Agregar columnas faltantes
ALTER TABLE exercise_sets 
ADD COLUMN IF NOT EXISTS rpe_score INTEGER CHECK (rpe_score >= 1 AND rpe_score <= 10);

-- Renombrar rest_taken_seconds a rest_duration_seconds si no existe
ALTER TABLE exercise_sets 
ADD COLUMN IF NOT EXISTS rest_duration_seconds INTEGER;

-- Copiar datos de rest_taken_seconds a rest_duration_seconds
UPDATE exercise_sets 
SET rest_duration_seconds = rest_taken_seconds
WHERE rest_duration_seconds IS NULL AND rest_taken_seconds IS NOT NULL;

-- Asegurar que set_type tenga los valores correctos
-- Actualizar valores existentes para que coincidan con nuestros tipos
UPDATE exercise_sets 
SET set_type = CASE 
  WHEN set_type IS NULL OR set_type = '' THEN 'normal'
  WHEN set_type = 'warmup' THEN 'warmup'
  WHEN set_type = 'failure' THEN 'failure'
  WHEN set_type = 'drop' OR set_type = 'dropset' THEN 'dropset'
  ELSE 'normal'
END;

-- Agregar constraint para set_type si no existe
DO $$
BEGIN
  -- Intentar agregar el constraint
  BEGIN
    ALTER TABLE exercise_sets 
    ADD CONSTRAINT exercise_sets_set_type_check 
    CHECK (set_type IN ('normal', 'warmup', 'failure', 'dropset'));
  EXCEPTION
    WHEN duplicate_object THEN
      -- El constraint ya existe, no hacer nada
      NULL;
  END;
END $$;

-- Asegurar que reps_completed no sea null (usar 0 como default)
UPDATE exercise_sets 
SET reps_completed = 0 
WHERE reps_completed IS NULL;

-- =====================================================
-- CREAR VISTA PARA COMPATIBILIDAD
-- =====================================================

-- Crear vista que mapee los nombres de columnas para compatibilidad
CREATE OR REPLACE VIEW training_exercise_sets AS
SELECT 
  id,
  session_id as workout_session_id,  -- Mapear session_id a workout_session_id
  exercise_id,
  set_number,
  COALESCE(set_type, 'normal') as set_type,
  weight_kg,
  COALESCE(reps_completed, 0) as reps_completed,
  rpe_score,
  COALESCE(rest_duration_seconds, rest_taken_seconds) as rest_duration_seconds,
  completed_at,
  notes,
  created_at
FROM exercise_sets;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para workout_sessions (solo los nuevos)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_status ON workout_sessions(user_id, status);

-- Índices para exercise_sets (usando nombres existentes)
CREATE INDEX IF NOT EXISTS idx_exercise_sets_session_id ON exercise_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_completed_at ON exercise_sets(completed_at DESC);

-- Índice compuesto para consultas de historial
CREATE INDEX IF NOT EXISTS idx_exercise_sets_user_history ON exercise_sets(exercise_id, completed_at DESC) 
  INCLUDE (session_id, weight_kg, reps_completed, set_type);

-- =====================================================
-- FUNCIONES AUXILIARES ADAPTADAS
-- =====================================================

-- Función para obtener sesión activa de un usuario
CREATE OR REPLACE FUNCTION get_active_workout_session(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  started_at TIMESTAMPTZ,
  total_duration_seconds INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ws.id, ws.name, ws.started_at, ws.total_duration_seconds, ws.status
  FROM workout_sessions ws
  WHERE ws.user_id = user_uuid 
    AND ws.status = 'active'
  ORDER BY ws.started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener mejor performance de un ejercicio (adaptada)
CREATE OR REPLACE FUNCTION get_best_exercise_performance(user_uuid UUID, exercise_uuid UUID)
RETURNS TABLE (
  weight_kg DECIMAL,
  reps_completed INTEGER,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT es.weight_kg, es.reps_completed, es.completed_at
  FROM exercise_sets es
  JOIN workout_sessions ws ON ws.id = es.session_id  -- Usar session_id en lugar de workout_session_id
  WHERE ws.user_id = user_uuid 
    AND es.exercise_id = exercise_uuid
    AND COALESCE(es.set_type, 'normal') = 'normal'
    AND es.weight_kg IS NOT NULL
  ORDER BY es.weight_kg DESC, es.reps_completed DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA (ADAPTADOS)
-- =====================================================

-- Trigger para actualizar updated_at en workout_sessions
CREATE OR REPLACE FUNCTION update_workout_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_workout_session_updated_at ON workout_sessions;
CREATE TRIGGER trigger_update_workout_session_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_session_updated_at();

-- Trigger para actualizar estadísticas (adaptado para usar session_id)
CREATE OR REPLACE FUNCTION update_exercise_stats_on_set_change()
RETURNS TRIGGER AS $$
DECLARE
  session_user_id UUID;
  exercise_id_val UUID;
BEGIN
  -- Obtener user_id de la sesión (usar session_id)
  SELECT user_id INTO session_user_id 
  FROM workout_sessions 
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  
  exercise_id_val := COALESCE(NEW.exercise_id, OLD.exercise_id);
  
  -- Actualizar o crear estadísticas
  INSERT INTO user_exercise_stats (
    user_id,
    exercise_id,
    total_sessions,
    total_sets,
    total_reps,
    total_volume_kg,
    best_weight_kg,
    best_reps,
    last_performed_at,
    first_performed_at
  )
  SELECT 
    session_user_id,
    exercise_id_val,
    COUNT(DISTINCT es.session_id),
    COUNT(es.id),
    SUM(COALESCE(es.reps_completed, 0)),
    SUM(COALESCE(es.weight_kg, 0) * COALESCE(es.reps_completed, 0)),
    MAX(es.weight_kg),
    MAX(es.reps_completed),
    MAX(es.completed_at),
    MIN(es.completed_at)
  FROM exercise_sets es
  JOIN workout_sessions ws ON ws.id = es.session_id
  WHERE es.exercise_id = exercise_id_val 
    AND ws.user_id = session_user_id
    AND ws.status = 'completed'
  GROUP BY ws.user_id, es.exercise_id
  ON CONFLICT (user_id, exercise_id) 
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_sets = EXCLUDED.total_sets,
    total_reps = EXCLUDED.total_reps,
    total_volume_kg = EXCLUDED.total_volume_kg,
    best_weight_kg = EXCLUDED.best_weight_kg,
    best_reps = EXCLUDED.best_reps,
    last_performed_at = EXCLUDED.last_performed_at,
    first_performed_at = LEAST(user_exercise_stats.first_performed_at, EXCLUDED.first_performed_at),
    updated_at = NOW();
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_exercise_stats_on_set_insert ON exercise_sets;
DROP TRIGGER IF EXISTS trigger_update_exercise_stats_on_set_update ON exercise_sets;
DROP TRIGGER IF EXISTS trigger_update_exercise_stats_on_set_delete ON exercise_sets;

CREATE TRIGGER trigger_update_exercise_stats_on_set_insert
  AFTER INSERT ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_stats_on_set_change();

CREATE TRIGGER trigger_update_exercise_stats_on_set_update
  AFTER UPDATE ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_stats_on_set_change();

CREATE TRIGGER trigger_update_exercise_stats_on_set_delete
  AFTER DELETE ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_stats_on_set_change();

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las columnas existen
DO $$
BEGIN
  -- Verificar columnas en workout_sessions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_sessions' AND column_name = 'status') THEN
    RAISE EXCEPTION 'Column status was not added to workout_sessions';
  END IF;
  
  -- Verificar que exercise_sets tiene las columnas necesarias
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_sets' AND column_name = 'session_id') THEN
    RAISE EXCEPTION 'Column session_id does not exist in exercise_sets';
  END IF;
  
  -- Verificar que la vista fue creada
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'training_exercise_sets') THEN
    RAISE EXCEPTION 'View training_exercise_sets was not created';
  END IF;
  
  RAISE NOTICE 'Training tables updated successfully! Using existing structure with compatibility layer.';
END $$;
