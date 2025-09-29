-- =====================================================
-- VERIFICAR DATOS HARDCODEADOS EN WORKOUT_SESSIONS
-- =====================================================

-- 1. Verificar si existen workout_sessions
SELECT 
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_sessions
FROM workout_sessions;

-- 2. Mostrar todas las sesiones existentes
SELECT 
  id,
  user_id,
  name,
  routine_id,
  status,
  started_at,
  completed_at,
  total_duration_seconds,
  session_date,
  notes
FROM workout_sessions 
ORDER BY started_at DESC;

-- 3. Verificar sesiones sospechosas (posible hardcode)
SELECT 
  id,
  name,
  total_duration_seconds,
  status,
  started_at,
  'Posible hardcode' as reason
FROM workout_sessions 
WHERE 
  -- Duraciones sospechosas (muy exactas o patrones)
  total_duration_seconds IN (3600, 7200, 1800, 5000, 10000)
  OR name LIKE '%test%'
  OR name LIKE '%demo%'
  OR name LIKE '%sample%'
  OR notes LIKE '%hardcode%'
  OR notes LIKE '%test%';

-- 4. Limpiar datos hardcodeados si existen
-- DESCOMENTA SOLO SI QUIERES ELIMINAR DATOS HARDCODEADOS:
/*
DELETE FROM workout_sessions 
WHERE 
  name LIKE '%test%'
  OR name LIKE '%demo%'
  OR name LIKE '%sample%'
  OR notes LIKE '%hardcode%'
  OR notes LIKE '%test%';
*/

-- 5. Verificar estado final
SELECT 
  'Estado final' as info,
  COUNT(*) as total_sessions_remaining
FROM workout_sessions;
