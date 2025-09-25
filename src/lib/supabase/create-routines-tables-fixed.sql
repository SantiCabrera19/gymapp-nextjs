-- =====================================================
-- ROUTINES MODULE - CREAR TABLAS DE RUTINAS (CORREGIDO)
-- =====================================================

-- IMPORTANTE: Este script crea las tablas necesarias para el módulo de rutinas
-- Versión corregida que maneja tablas existentes

-- =====================================================
-- LIMPIAR TABLAS EXISTENTES SI HAY CONFLICTOS
-- =====================================================

-- Eliminar índices si existen
DROP INDEX IF EXISTS idx_routines_user_id;
DROP INDEX IF EXISTS idx_routines_active;
DROP INDEX IF EXISTS idx_routines_public;
DROP INDEX IF EXISTS idx_routines_difficulty;
DROP INDEX IF EXISTS idx_routines_created_at;
DROP INDEX IF EXISTS idx_routines_name_search;
DROP INDEX IF EXISTS idx_routine_exercises_routine_id;
DROP INDEX IF EXISTS idx_routine_exercises_exercise_id;
DROP INDEX IF EXISTS idx_routine_exercises_order;

-- Eliminar políticas RLS si existen
DROP POLICY IF EXISTS "Users can view their own routines" ON routines;
DROP POLICY IF EXISTS "Users can view public routines" ON routines;
DROP POLICY IF EXISTS "Users can create their own routines" ON routines;
DROP POLICY IF EXISTS "Users can update their own routines" ON routines;
DROP POLICY IF EXISTS "Users can delete their own routines" ON routines;
DROP POLICY IF EXISTS "Users can view routine exercises of their routines" ON routine_exercises;
DROP POLICY IF EXISTS "Users can view routine exercises of public routines" ON routine_exercises;
DROP POLICY IF EXISTS "Users can manage routine exercises of their routines" ON routine_exercises;

-- Eliminar triggers si existen
DROP TRIGGER IF EXISTS update_routines_updated_at ON routines;
DROP TRIGGER IF EXISTS validate_routine_exercise_order_trigger ON routine_exercises;

-- Eliminar funciones si existen
DROP FUNCTION IF EXISTS validate_routine_exercise_order();

-- Eliminar tablas si existen (CUIDADO: esto borra datos)
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS routines CASCADE;

-- =====================================================
-- CREAR TABLA RUTINAS
-- =====================================================

CREATE TABLE routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT routines_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT routines_duration_positive CHECK (estimated_duration_minutes > 0)
);

-- =====================================================
-- CREAR TABLA EJERCICIOS DE RUTINA
-- =====================================================

CREATE TABLE routine_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_in_routine INTEGER NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  rest_seconds INTEGER DEFAULT 60,
  weight_suggestion_kg DECIMAL(5,2),
  rpe_target INTEGER CHECK (rpe_target >= 1 AND rpe_target <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT routine_exercises_unique_order UNIQUE (routine_id, order_in_routine),
  CONSTRAINT routine_exercises_unique_exercise UNIQUE (routine_id, exercise_id),
  CONSTRAINT routine_exercises_sets_positive CHECK (sets > 0),
  CONSTRAINT routine_exercises_reps_positive CHECK (reps > 0),
  CONSTRAINT routine_exercises_rest_positive CHECK (rest_seconds >= 0)
);

-- =====================================================
-- CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para rutinas
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_active ON routines(is_active) WHERE is_active = true;
CREATE INDEX idx_routines_public ON routines(is_public) WHERE is_public = true;
CREATE INDEX idx_routines_difficulty ON routines(difficulty_level);
CREATE INDEX idx_routines_created_at ON routines(created_at DESC);
CREATE INDEX idx_routines_name_search ON routines USING gin(to_tsvector('spanish', name));

-- Índices para ejercicios de rutina
CREATE INDEX idx_routine_exercises_routine_id ON routine_exercises(routine_id);
CREATE INDEX idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);
CREATE INDEX idx_routine_exercises_order ON routine_exercises(routine_id, order_in_routine);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR POLÍTICAS RLS
-- =====================================================

-- Políticas para rutinas
CREATE POLICY "Users can view their own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public routines" ON routines
  FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Users can create their own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para ejercicios de rutina
CREATE POLICY "Users can view routine exercises of their routines" ON routine_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routines 
      WHERE routines.id = routine_exercises.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view routine exercises of public routines" ON routine_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routines 
      WHERE routines.id = routine_exercises.routine_id 
      AND routines.is_public = true 
      AND routines.is_active = true
    )
  );

CREATE POLICY "Users can manage routine exercises of their routines" ON routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM routines 
      WHERE routines.id = routine_exercises.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

-- =====================================================
-- CREAR TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para rutinas
CREATE TRIGGER update_routines_updated_at 
  BEFORE UPDATE ON routines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar orden de ejercicios
CREATE OR REPLACE FUNCTION validate_routine_exercise_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Asegurar que el orden sea secuencial (1, 2, 3, ...)
  IF NEW.order_in_routine <= 0 THEN
    RAISE EXCEPTION 'El orden debe ser mayor a 0';
  END IF;
  
  -- Si es INSERT, ajustar órdenes existentes si es necesario
  IF TG_OP = 'INSERT' THEN
    UPDATE routine_exercises 
    SET order_in_routine = order_in_routine + 1
    WHERE routine_id = NEW.routine_id 
    AND order_in_routine >= NEW.order_in_routine
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar orden
CREATE TRIGGER validate_routine_exercise_order_trigger
  BEFORE INSERT OR UPDATE ON routine_exercises
  FOR EACH ROW EXECUTE FUNCTION validate_routine_exercise_order();

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE routines IS 'Rutinas de entrenamiento creadas por usuarios';
COMMENT ON TABLE routine_exercises IS 'Ejercicios que componen cada rutina con su configuración específica';

COMMENT ON COLUMN routines.difficulty_level IS 'Nivel de dificultad: beginner, intermediate, advanced';
COMMENT ON COLUMN routines.estimated_duration_minutes IS 'Duración estimada en minutos';
COMMENT ON COLUMN routines.is_public IS 'Si la rutina es visible para otros usuarios';
COMMENT ON COLUMN routines.tags IS 'Etiquetas para categorizar la rutina';

COMMENT ON COLUMN routine_exercises.order_in_routine IS 'Orden del ejercicio en la rutina (1, 2, 3...)';
COMMENT ON COLUMN routine_exercises.rpe_target IS 'RPE objetivo (Rate of Perceived Exertion) del 1 al 10';
COMMENT ON COLUMN routine_exercises.weight_suggestion_kg IS 'Peso sugerido en kilogramos';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 'routines' as table_name, count(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'routines' AND table_schema = 'public'
UNION ALL
SELECT 'routine_exercises' as table_name, count(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'routine_exercises' AND table_schema = 'public';

-- =====================================================
-- FIN DEL SCRIPT CORREGIDO
-- =====================================================
