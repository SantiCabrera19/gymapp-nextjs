-- =====================================================
-- AGREGAR SOLO LAS TABLAS FALTANTES PARA LA PÁGINA DE DETALLE
-- =====================================================

-- 1. Tabla para records personales por ejercicio
CREATE TABLE IF NOT EXISTS user_exercise_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL, -- 'max_weight', 'max_reps', 'best_volume', 'one_rm'
  value DECIMAL(10,2) NOT NULL, -- Valor del record
  secondary_value INTEGER, -- Para casos como peso x reps
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  workout_session_id UUID REFERENCES workout_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- 2. Tabla para favoritos de ejercicios
CREATE TABLE IF NOT EXISTS user_exercise_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- 3. Tabla para estadísticas agregadas por ejercicio y usuario
CREATE TABLE IF NOT EXISTS user_exercise_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  total_volume_kg DECIMAL(10,2) DEFAULT 0, -- Peso total levantado
  best_weight_kg DECIMAL(5,2),
  best_reps INTEGER,
  estimated_1rm_kg DECIMAL(5,2),
  last_performed_at TIMESTAMPTZ,
  first_performed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- 4. Tabla para objetivos de usuario por ejercicio
CREATE TABLE IF NOT EXISTS user_exercise_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'weight', 'reps', 'volume', 'frequency'
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índices para user_exercise_records
CREATE INDEX IF NOT EXISTS idx_user_exercise_records_user_exercise ON user_exercise_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_records_type ON user_exercise_records(record_type);

-- Índices para user_exercise_stats
CREATE INDEX IF NOT EXISTS idx_user_exercise_stats_user_exercise ON user_exercise_stats(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_stats_last_performed ON user_exercise_stats(last_performed_at);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE user_exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_goals ENABLE ROW LEVEL SECURITY;

-- Políticas para user_exercise_records
CREATE POLICY "Users can manage their own exercise records" ON user_exercise_records
FOR ALL USING (user_id = auth.uid());

-- Políticas para user_exercise_favorites
CREATE POLICY "Users can manage their own exercise favorites" ON user_exercise_favorites
FOR ALL USING (user_id = auth.uid());

-- Políticas para user_exercise_stats
CREATE POLICY "Users can view their own exercise stats" ON user_exercise_stats
FOR ALL USING (user_id = auth.uid());

-- Políticas para user_exercise_goals
CREATE POLICY "Users can manage their own exercise goals" ON user_exercise_goals
FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS AUTOMÁTICAMENTE
-- =====================================================

-- Función para actualizar estadísticas cuando se inserta un nuevo set
CREATE OR REPLACE FUNCTION update_exercise_stats_from_sets()
RETURNS TRIGGER AS $$
DECLARE
  session_user_id UUID;
BEGIN
  -- Obtener el user_id desde workout_sessions
  SELECT user_id INTO session_user_id 
  FROM workout_sessions 
  WHERE id = NEW.session_id;
  
  -- Insertar o actualizar estadísticas del usuario para este ejercicio
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
    NEW.exercise_id,
    COUNT(DISTINCT es.session_id),
    COUNT(*),
    COALESCE(SUM(es.reps_completed), 0),
    COALESCE(SUM(es.weight_kg * es.reps_completed), 0),
    MAX(es.weight_kg),
    MAX(es.reps_completed),
    MAX(es.completed_at),
    MIN(es.completed_at)
  FROM exercise_sets es
  JOIN workout_sessions ws ON es.session_id = ws.id
  WHERE ws.user_id = session_user_id AND es.exercise_id = NEW.exercise_id
  ON CONFLICT (user_id, exercise_id) 
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_sets = EXCLUDED.total_sets,
    total_reps = EXCLUDED.total_reps,
    total_volume_kg = EXCLUDED.total_volume_kg,
    best_weight_kg = EXCLUDED.best_weight_kg,
    best_reps = EXCLUDED.best_reps,
    last_performed_at = EXCLUDED.last_performed_at,
    updated_at = NOW();

  -- Actualizar records si es necesario
  IF NEW.weight_kg IS NOT NULL THEN
    INSERT INTO user_exercise_records (user_id, exercise_id, record_type, value, achieved_at, workout_session_id)
    VALUES (session_user_id, NEW.exercise_id, 'max_weight', NEW.weight_kg, NEW.completed_at, NEW.session_id)
    ON CONFLICT (user_id, exercise_id, record_type)
    DO UPDATE SET
      value = GREATEST(user_exercise_records.value, EXCLUDED.value),
      achieved_at = CASE 
        WHEN EXCLUDED.value > user_exercise_records.value THEN EXCLUDED.achieved_at
        ELSE user_exercise_records.achieved_at
      END,
      workout_session_id = CASE 
        WHEN EXCLUDED.value > user_exercise_records.value THEN EXCLUDED.workout_session_id
        ELSE user_exercise_records.workout_session_id
      END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas automáticamente
CREATE TRIGGER trigger_update_exercise_stats_from_sets
  AFTER INSERT ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_stats_from_sets();

-- =====================================================
-- DATOS DE EJEMPLO PARA TESTING
-- =====================================================

-- Insertar datos de ejemplo usando las tablas existentes
DO $$
DECLARE
  sample_user_id UUID;
  sample_exercise_id UUID;
  sample_session_id UUID;
BEGIN
  -- Obtener un usuario de ejemplo
  SELECT id INTO sample_user_id FROM users LIMIT 1;
  
  -- Obtener un ejercicio de ejemplo
  SELECT id INTO sample_exercise_id FROM exercises WHERE name = 'Press de Banca Plano' LIMIT 1;
  
  -- Solo insertar datos si tenemos usuario y ejercicio
  IF sample_user_id IS NOT NULL AND sample_exercise_id IS NOT NULL THEN
    
    -- Obtener una sesión existente o crear una nueva
    SELECT id INTO sample_session_id FROM workout_sessions WHERE user_id = sample_user_id LIMIT 1;
    
    IF sample_session_id IS NULL THEN
      INSERT INTO workout_sessions (id, user_id, session_date, started_at, completed_at, total_duration_minutes)
      VALUES (gen_random_uuid(), sample_user_id, CURRENT_DATE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 60)
      RETURNING id INTO sample_session_id;
    END IF;
    
    -- Insertar algunos sets de ejemplo (usando la estructura existente)
    INSERT INTO exercise_sets (exercise_id, session_id, set_number, weight_kg, reps_completed, completed_at)
    VALUES 
      (sample_exercise_id, sample_session_id, 1, 60.0, 10, NOW() - INTERVAL '90 minutes'),
      (sample_exercise_id, sample_session_id, 2, 65.0, 8, NOW() - INTERVAL '85 minutes'),
      (sample_exercise_id, sample_session_id, 3, 70.0, 6, NOW() - INTERVAL '80 minutes')
    ON CONFLICT DO NOTHING;
    
    -- Marcar como favorito
    INSERT INTO user_exercise_favorites (user_id, exercise_id)
    VALUES (sample_user_id, sample_exercise_id)
    ON CONFLICT DO NOTHING;
    
    -- Crear algunos records adicionales
    INSERT INTO user_exercise_records (user_id, exercise_id, record_type, value, achieved_at)
    VALUES 
      (sample_user_id, sample_exercise_id, 'max_weight', 85.0, NOW() - INTERVAL '1 week'),
      (sample_user_id, sample_exercise_id, 'one_rm', 92.0, NOW() - INTERVAL '1 week'),
      (sample_user_id, sample_exercise_id, 'best_volume', 440.0, NOW() - INTERVAL '3 days')
    ON CONFLICT DO NOTHING;
    
  END IF;
END $$;
