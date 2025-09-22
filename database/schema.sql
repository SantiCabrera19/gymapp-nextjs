-- =====================================================
-- GYMAPP DATABASE SCHEMA - PostgreSQL/Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends auth.users)
-- =====================================================
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  weight_kg DECIMAL(5,2),
  height_cm INTEGER,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  preferred_units TEXT CHECK (preferred_units IN ('metric', 'imperial')) DEFAULT 'metric',
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. MUSCLES TABLE
-- =====================================================
CREATE TABLE muscles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_short TEXT NOT NULL,
  muscle_group TEXT NOT NULL CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio')),
  is_major BOOLEAN DEFAULT true,
  description TEXT,
  anatomical_region TEXT CHECK (anatomical_region IN ('upper_body', 'lower_body', 'core')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. EXERCISES TABLE
-- =====================================================
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group_primary TEXT NOT NULL,
  equipment TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  instructions TEXT,
  tips TEXT,
  image_url TEXT,
  video_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. EXERCISE_MUSCLES TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE exercise_muscles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  muscle_id UUID REFERENCES muscles(id) ON DELETE CASCADE NOT NULL,
  involvement_level TEXT CHECK (involvement_level IN ('primary', 'secondary', 'stabilizer')) NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5) DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exercise_id, muscle_id)
);

-- =====================================================
-- 5. ROUTINES TABLE
-- =====================================================
CREATE TABLE routines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  days_per_week INTEGER CHECK (days_per_week >= 1 AND days_per_week <= 7) DEFAULT 3,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ROUTINE_EXERCISES TABLE
-- =====================================================
CREATE TABLE routine_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7) NOT NULL,
  exercise_order INTEGER NOT NULL,
  target_sets INTEGER DEFAULT 3,
  target_reps_min INTEGER DEFAULT 8,
  target_reps_max INTEGER DEFAULT 12,
  rest_seconds INTEGER DEFAULT 90,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. WORKOUT_SESSIONS TABLE
-- =====================================================
CREATE TABLE workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
  session_date DATE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. EXERCISE_SETS TABLE
-- =====================================================
CREATE TABLE exercise_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  routine_exercise_id UUID REFERENCES routine_exercises(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL(6,2),
  reps_completed INTEGER,
  reps_target INTEGER,
  set_type TEXT CHECK (set_type IN ('normal', 'warmup', 'failure', 'drop_set', 'rest_pause', 'cluster')) DEFAULT 'normal',
  rir INTEGER CHECK (rir >= 0 AND rir <= 10),
  rest_taken_seconds INTEGER,
  previous_set_id UUID REFERENCES exercise_sets(id) ON DELETE SET NULL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_primary);
CREATE INDEX idx_exercises_custom ON exercises(is_custom, created_by_user_id);
CREATE INDEX idx_routines_user_active ON routines(user_id, is_active);
CREATE INDEX idx_routine_exercises_routine_day ON routine_exercises(routine_id, day_of_week);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
CREATE INDEX idx_exercise_sets_session ON exercise_sets(session_id);
CREATE INDEX idx_exercise_sets_exercise ON exercise_sets(exercise_id);
CREATE INDEX idx_exercise_sets_previous ON exercise_sets(previous_set_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Exercises policies (base exercises public, custom private)
CREATE POLICY "Base exercises are public" ON exercises FOR SELECT USING (is_custom = false);
CREATE POLICY "Users can view own custom exercises" ON exercises FOR SELECT USING (is_custom = true AND created_by_user_id = auth.uid());
CREATE POLICY "Users can create custom exercises" ON exercises FOR INSERT WITH CHECK (created_by_user_id = auth.uid());
CREATE POLICY "Users can update own custom exercises" ON exercises FOR UPDATE USING (created_by_user_id = auth.uid());

-- Routines policies
CREATE POLICY "Users can manage own routines" ON routines FOR ALL USING (user_id = auth.uid());

-- Routine exercises policies
CREATE POLICY "Users can manage own routine exercises" ON routine_exercises FOR ALL USING (
  routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
);

-- Workout sessions policies
CREATE POLICY "Users can manage own workout sessions" ON workout_sessions FOR ALL USING (user_id = auth.uid());

-- Exercise sets policies
CREATE POLICY "Users can manage own exercise sets" ON exercise_sets FOR ALL USING (
  session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA - MUSCLES
-- =====================================================
INSERT INTO muscles (name, name_short, muscle_group, is_major, anatomical_region, description) VALUES
-- CHEST
('Pectoral mayor', 'Pecho', 'chest', true, 'upper_body', 'Músculo principal del pecho'),
('Pectoral menor', 'Pecho menor', 'chest', false, 'upper_body', 'Músculo estabilizador del pecho'),
('Serrato anterior', 'Serrato', 'chest', false, 'upper_body', 'Músculo auxiliar del pecho'),

-- BACK
('Dorsal ancho', 'Dorsales', 'back', true, 'upper_body', 'Músculo principal de la espalda'),
('Trapecio', 'Trapecios', 'back', true, 'upper_body', 'Músculo superior de la espalda'),
('Romboides', 'Romboides', 'back', false, 'upper_body', 'Músculo medio de la espalda'),
('Redondo mayor', 'Redondo mayor', 'back', false, 'upper_body', 'Músculo auxiliar de la espalda'),
('Infraespinoso', 'Infraespinoso', 'back', false, 'upper_body', 'Músculo del manguito rotador'),

-- SHOULDERS
('Deltoides', 'Hombros', 'shoulders', true, 'upper_body', 'Músculo principal del hombro'),
('Supraespinoso', 'Supraespinoso', 'shoulders', false, 'upper_body', 'Músculo del manguito rotador'),

-- ARMS
('Bíceps', 'Bíceps', 'arms', true, 'upper_body', 'Músculo frontal del brazo'),
('Tríceps', 'Tríceps', 'arms', true, 'upper_body', 'Músculo posterior del brazo'),
('Braquial', 'Braquial', 'arms', false, 'upper_body', 'Músculo profundo del brazo'),
('Braquiorradial', 'Antebrazo', 'arms', false, 'upper_body', 'Músculo del antebrazo'),

-- LEGS
('Cuádriceps', 'Cuádriceps', 'legs', true, 'lower_body', 'Músculo frontal del muslo'),
('Glúteo mayor', 'Glúteos', 'legs', true, 'lower_body', 'Músculo principal de los glúteos'),
('Glúteo medio', 'Glúteo medio', 'legs', false, 'lower_body', 'Músculo lateral de los glúteos'),
('Bíceps femoral', 'Isquiotibiales', 'legs', true, 'lower_body', 'Músculo posterior del muslo'),
('Semitendinoso', 'Isquiotibiales', 'legs', false, 'lower_body', 'Músculo posterior del muslo'),
('Semimembranoso', 'Isquiotibiales', 'legs', false, 'lower_body', 'Músculo posterior del muslo'),
('Gastrocnemio', 'Gemelos', 'legs', true, 'lower_body', 'Músculo principal de la pantorrilla'),
('Sóleo', 'Sóleo', 'legs', false, 'lower_body', 'Músculo profundo de la pantorrilla'),
('Tibial anterior', 'Tibial', 'legs', false, 'lower_body', 'Músculo frontal de la espinilla'),
('Aductor largo', 'Aductores', 'legs', false, 'lower_body', 'Músculo interno del muslo'),

-- CORE
('Recto del abdomen', 'Abdominales', 'core', true, 'core', 'Músculo frontal del abdomen'),
('Oblicuo externo', 'Oblicuos', 'core', true, 'core', 'Músculo lateral del abdomen'),
('Oblicuo interno', 'Oblicuos internos', 'core', false, 'core', 'Músculo profundo lateral'),
('Transverso del abdomen', 'Transverso', 'core', false, 'core', 'Músculo profundo del core');

-- =====================================================
-- INITIAL DATA - BASE EXERCISES
-- =====================================================
INSERT INTO exercises (name, description, muscle_group_primary, equipment, difficulty_level, instructions, tips) VALUES
-- CHEST EXERCISES
('Press de banca', 'Ejercicio fundamental para el desarrollo del pecho', 'chest', 'barbell', 'intermediate', 
 'Acuéstate en el banco, agarra la barra con las manos separadas al ancho de los hombros, baja controladamente hasta el pecho y empuja hacia arriba.',
 'Mantén los pies firmes en el suelo y la espalda ligeramente arqueada.'),

('Press inclinado con mancuernas', 'Desarrollo del pecho superior con mancuernas', 'chest', 'dumbbell', 'intermediate',
 'En banco inclinado a 30-45°, sube las mancuernas desde la posición baja hasta arriba juntándolas.',
 'Controla el descenso y siente el estiramiento en el pecho.'),

('Flexiones', 'Ejercicio básico de peso corporal para pecho', 'chest', 'bodyweight', 'beginner',
 'En posición de plancha, baja el cuerpo hasta casi tocar el suelo y empuja hacia arriba.',
 'Mantén el cuerpo recto y el core activado.'),

-- BACK EXERCISES
('Dominadas', 'Ejercicio fundamental para la espalda', 'back', 'bodyweight', 'intermediate',
 'Colgado de la barra, tira del cuerpo hacia arriba hasta que la barbilla pase la barra.',
 'Controla el descenso y evita balancearte.'),

('Remo con barra', 'Desarrollo de la espalda media con barra', 'back', 'barbell', 'intermediate',
 'Inclinado hacia adelante, tira de la barra hacia el abdomen manteniendo la espalda recta.',
 'Aprieta las escápulas al final del movimiento.'),

('Peso muerto', 'Ejercicio compuesto fundamental', 'back', 'barbell', 'advanced',
 'Con la barra en el suelo, levántala manteniendo la espalda recta hasta estar completamente erguido.',
 'Mantén la barra cerca del cuerpo durante todo el movimiento.'),

-- LEG EXERCISES
('Sentadilla', 'Ejercicio fundamental para piernas', 'legs', 'barbell', 'intermediate',
 'Con la barra en los hombros, baja como si te fueras a sentar hasta que los muslos estén paralelos al suelo.',
 'Mantén las rodillas alineadas con los pies y el pecho erguido.'),

('Prensa de piernas', 'Desarrollo de cuádriceps y glúteos en máquina', 'legs', 'machine', 'beginner',
 'En la máquina, baja la plataforma controladamente y empuja hacia arriba.',
 'No bloquees completamente las rodillas al subir.'),

('Zancadas', 'Ejercicio unilateral para piernas', 'legs', 'bodyweight', 'beginner',
 'Da un paso largo hacia adelante, baja hasta que ambas rodillas estén a 90° y regresa.',
 'Mantén el torso erguido y el peso en el talón delantero.'),

-- SHOULDER EXERCISES
('Press militar', 'Desarrollo de hombros con barra', 'shoulders', 'barbell', 'intermediate',
 'De pie, empuja la barra desde los hombros hacia arriba hasta extender completamente los brazos.',
 'Mantén el core activado y evita arquear excesivamente la espalda.'),

('Elevaciones laterales', 'Aislamiento de deltoides lateral', 'shoulders', 'dumbbell', 'beginner',
 'Con mancuernas a los lados, eleva los brazos lateralmente hasta la altura de los hombros.',
 'Controla el movimiento y evita usar impulso.'),

('Face pulls', 'Ejercicio para deltoides posterior', 'shoulders', 'cable', 'beginner',
 'Tira de la cuerda hacia la cara separando las manos al final del movimiento.',
 'Aprieta las escápulas y mantén los codos altos.'),

-- ARM EXERCISES
('Curl de bíceps', 'Ejercicio básico para bíceps', 'arms', 'dumbbell', 'beginner',
 'Con mancuernas, flexiona los codos llevando el peso hacia los hombros.',
 'Mantén los codos pegados al cuerpo y controla el descenso.'),

('Press francés', 'Ejercicio para tríceps acostado', 'arms', 'barbell', 'intermediate',
 'Acostado, baja la barra hacia la frente flexionando solo los codos.',
 'Mantén los codos fijos y controla el movimiento.'),

('Fondos en paralelas', 'Ejercicio compuesto para tríceps', 'arms', 'bodyweight', 'intermediate',
 'En paralelas, baja el cuerpo flexionando los codos y empuja hacia arriba.',
 'Inclínate ligeramente hacia adelante para enfocar más el pecho.');

-- =====================================================
-- INITIAL DATA - EXERCISE_MUSCLES MAPPING
-- =====================================================
-- Press de banca
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 5 FROM exercises e, muscles m WHERE e.name = 'Press de banca' AND m.name = 'Pectoral mayor';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 3 FROM exercises e, muscles m WHERE e.name = 'Press de banca' AND m.name = 'Deltoides';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 4 FROM exercises e, muscles m WHERE e.name = 'Press de banca' AND m.name = 'Tríceps';

-- Sentadilla
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 5 FROM exercises e, muscles m WHERE e.name = 'Sentadilla' AND m.name = 'Cuádriceps';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 4 FROM exercises e, muscles m WHERE e.name = 'Sentadilla' AND m.name = 'Glúteo mayor';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'stabilizer', 3 FROM exercises e, muscles m WHERE e.name = 'Sentadilla' AND m.name = 'Recto del abdomen';

-- Dominadas
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 5 FROM exercises e, muscles m WHERE e.name = 'Dominadas' AND m.name = 'Dorsal ancho';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 4 FROM exercises e, muscles m WHERE e.name = 'Dominadas' AND m.name = 'Bíceps';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 3 FROM exercises e, muscles m WHERE e.name = 'Dominadas' AND m.name = 'Romboides';

-- Press militar
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 5 FROM exercises e, muscles m WHERE e.name = 'Press militar' AND m.name = 'Deltoides';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 3 FROM exercises e, muscles m WHERE e.name = 'Press militar' AND m.name = 'Tríceps';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'stabilizer', 3 FROM exercises e, muscles m WHERE e.name = 'Press militar' AND m.name = 'Recto del abdomen';

-- Peso muerto
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 5 FROM exercises e, muscles m WHERE e.name = 'Peso muerto' AND m.name = 'Bíceps femoral';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'primary', 4 FROM exercises e, muscles m WHERE e.name = 'Peso muerto' AND m.name = 'Glúteo mayor';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 4 FROM exercises e, muscles m WHERE e.name = 'Peso muerto' AND m.name = 'Dorsal ancho';
INSERT INTO exercise_muscles (exercise_id, muscle_id, involvement_level, intensity) 
SELECT e.id, m.id, 'secondary', 3 FROM exercises e, muscles m WHERE e.name = 'Peso muerto' AND m.name = 'Trapecio';
