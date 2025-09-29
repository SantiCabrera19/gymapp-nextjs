-- =====================================================
-- LIMPIAR SESIONES INVÁLIDAS - SCRIPT DE EMERGENCIA
-- =====================================================

-- Este script limpia sesiones activas que no tienen rutina asociada
-- Estas sesiones causan problemas de estado en la aplicación

-- 1. Identificar sesiones problemáticas
SELECT 
  id,
  user_id,
  name,
  routine_id,
  status,
  started_at
FROM workout_sessions 
WHERE status = 'active' 
  AND routine_id IS NULL;

-- 2. Marcar como canceladas las sesiones sin rutina
UPDATE workout_sessions 
SET 
  status = 'cancelled',
  completed_at = NOW(),
  notes = COALESCE(notes, '') || ' [Auto-cancelled: No routine associated]'
WHERE status = 'active' 
  AND routine_id IS NULL;

-- 3. Verificar que no queden sesiones activas sin rutina
SELECT COUNT(*) as invalid_sessions_remaining
FROM workout_sessions 
WHERE status = 'active' 
  AND routine_id IS NULL;

-- 4. Mostrar sesiones limpiadas
SELECT 
  id,
  user_id,
  name,
  status,
  completed_at,
  notes
FROM workout_sessions 
WHERE notes LIKE '%Auto-cancelled: No routine associated%'
ORDER BY completed_at DESC;

-- =====================================================
-- PREVENCIÓN FUTURA
-- =====================================================

-- Agregar constraint para prevenir sesiones sin rutina
ALTER TABLE workout_sessions 
ADD CONSTRAINT check_routine_required 
CHECK (
  (status = 'active' AND routine_id IS NOT NULL) 
  OR status != 'active'
);

-- Comentario explicativo
COMMENT ON CONSTRAINT check_routine_required ON workout_sessions IS 
'Previene sesiones activas sin rutina asociada para mantener consistencia de datos';
