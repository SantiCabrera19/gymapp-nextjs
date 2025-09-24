-- =====================================================
-- LIMPIAR DATOS DE USUARIO PARA DESARROLLO
-- =====================================================

-- IMPORTANTE: Este script elimina TODOS los datos de usuario
-- pero mantiene los ejercicios base y la estructura

-- 1. Limpiar datos de entrenamiento (en orden por FK)
DELETE FROM user_exercise_records;
DELETE FROM user_exercise_stats;
DELETE FROM user_exercise_favorites;
DELETE FROM user_exercise_goals;
DELETE FROM exercise_sets;
DELETE FROM workout_sessions;

-- 2. Limpiar rutinas de usuario
DELETE FROM routine_exercises;
DELETE FROM routines;

-- 3. Resetear secuencias si es necesario
-- (Las tablas usan UUID, no necesitan reset de secuencias)

-- 4. Verificar que las tablas estén vacías
SELECT 'workout_sessions' as tabla, COUNT(*) as registros FROM workout_sessions
UNION ALL
SELECT 'exercise_sets' as tabla, COUNT(*) as registros FROM exercise_sets
UNION ALL
SELECT 'user_exercise_records' as tabla, COUNT(*) as registros FROM user_exercise_records
UNION ALL
SELECT 'user_exercise_stats' as tabla, COUNT(*) as registros FROM user_exercise_stats
UNION ALL
SELECT 'user_exercise_favorites' as tabla, COUNT(*) as registros FROM user_exercise_favorites
UNION ALL
SELECT 'user_exercise_goals' as tabla, COUNT(*) as registros FROM user_exercise_goals
UNION ALL
SELECT 'routines' as tabla, COUNT(*) as registros FROM routines
UNION ALL
SELECT 'routine_exercises' as tabla, COUNT(*) as registros FROM routine_exercises;

-- =====================================================
-- MANTENER INTACTOS (NO BORRAR):
-- =====================================================
-- - exercises (ejercicios base)
-- - muscles (músculos)
-- - exercise_muscles (relaciones ejercicio-músculo)
-- - users (usuarios registrados)
-- =====================================================
