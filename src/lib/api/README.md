# 📚 **API DOCUMENTATION - EXERCISES & USER DATA**

## **🎯 OVERVIEW**

Esta documentación cubre todas las APIs relacionadas con ejercicios y datos de usuario implementadas para soportar las nuevas funcionalidades de la aplicación.

---

## **📂 ESTRUCTURA DE ARCHIVOS**

```
src/lib/api/
├── exercises.ts          # API básica de ejercicios
├── user-exercises.ts     # API de datos de usuario
├── auth/                 # Autenticación
├── avatar.ts            # Gestión de avatares
└── index.ts             # Exports centralizados
```

---

## **🔗 ENDPOINTS PRINCIPALES**

### **📋 EXERCISES API (`exercises.ts`)**

#### **`getExercises(userId?: string): Promise<Exercise[]>`**

- **Propósito**: Obtener lista completa de ejercicios
- **Parámetros**:
  - `userId` (opcional): Si se proporciona, incluye datos personales (favoritos, stats)
- **Retorna**: Array de ejercicios con datos básicos o enriquecidos
- **Uso**: Catálogo principal, listados

#### **`getExerciseById(id: string, userId?: string): Promise<Exercise | null>`**

- **Propósito**: Obtener ejercicio específico por ID
- **Parámetros**:
  - `id`: UUID del ejercicio
  - `userId` (opcional): Para incluir datos personales
- **Retorna**: Ejercicio completo con datos de usuario si aplica
- **Uso**: Página de detalle

#### **`getRecommendedExercises(experienceLevel: string): Promise<Exercise[]>`**

- **Propósito**: Ejercicios recomendados por nivel de experiencia
- **Parámetros**: `experienceLevel` ('beginner', 'intermediate', 'advanced')
- **Retorna**: Array filtrado por dificultad
- **Uso**: Dashboard, recomendaciones

#### **`searchExercises(query: string): Promise<Exercise[]>`**

- **Propósito**: Búsqueda de ejercicios por texto
- **Parámetros**: `query` - término de búsqueda
- **Retorna**: Ejercicios que coinciden en nombre/descripción
- **Uso**: Barra de búsqueda

---

### **👤 USER EXERCISES API (`user-exercises.ts`)**

#### **FAVORITOS**

##### **`getUserFavoriteExercises(userId: string): Promise<string[]>`**

- **Propósito**: Obtener IDs de ejercicios favoritos del usuario
- **Seguridad**: RLS automático por user_id
- **Retorna**: Array de exercise_ids

##### **`toggleExerciseFavorite(userId: string, exerciseId: string): Promise<{isFavorite: boolean}>`**

- **Propósito**: Marcar/desmarcar ejercicio como favorito
- **Lógica**: Verifica existencia y toggle automático
- **Retorna**: Estado final del favorito

#### **RECORDS PERSONALES**

##### **`getExerciseRecords(userId: string, exerciseId: string): Promise<ExerciseRecord[]>`**

- **Propósito**: Records específicos de un ejercicio
- **Tipos**: max_weight, max_reps, best_volume, one_rm
- **Ordenado**: Por fecha descendente

##### **`getUserTopRecords(userId: string, limit: number): Promise<ExerciseRecord[]>`**

- **Propósito**: Top records del usuario (todos los ejercicios)
- **Filtro**: Solo max_weight por defecto
- **Uso**: Dashboard, achievements

#### **ESTADÍSTICAS**

##### **`getExerciseStats(userId: string, exerciseId: string): Promise<ExerciseStats | null>`**

- **Propósito**: Estadísticas agregadas de un ejercicio
- **Datos**: Sesiones, sets, reps, volumen, mejores marcas
- **Actualización**: Automática via triggers SQL

##### **`getUserOverallStats(userId: string): Promise<OverallStats>`**

- **Propósito**: Estadísticas generales del usuario
- **Incluye**: Total workouts, ejercicios, volumen, grupo muscular favorito
- **Uso**: Dashboard principal

#### **PROGRESO HISTÓRICO**

##### **`getExerciseProgress(userId: string, exerciseId: string, months: number): Promise<ProgressDataPoint[]>`**

- **Propósito**: Datos históricos para gráficos
- **Período**: Últimos N meses (default: 6)
- **Agrupación**: Por mes con máximos/promedios
- **Formato**: Listo para gráficos

#### **DATOS ENRIQUECIDOS**

##### **`getExercisesWithUserData(userId: string): Promise<Exercise[]>`**

- **Propósito**: Ejercicios con datos personales integrados
- **Incluye**: is_favorite, user_stats, last_performed
- **Uso**: Catálogo personalizado

---

## **🎣 HOOKS ESPECIALIZADOS (`useExerciseData.ts`)**

### **`useExerciseRecords(exerciseId: string)`**

- **Estados**: records, loading, error, hasData
- **Auto-loading**: Basado en autenticación
- **Uso**: Componente ExerciseRecords

### **`useExerciseStats(exerciseId: string)`**

- **Estados**: stats, loading, error, hasData
- **Datos**: Estadísticas agregadas
- **Uso**: Cards de estadísticas

### **`useExerciseProgress(exerciseId: string, months?: number)`**

- **Estados**: progress, loading, error, hasData, chartData
- **Transformación**: Datos listos para gráficos
- **Uso**: ExerciseProgressChart

### **`useExerciseFavorite(exerciseId: string, initialIsFavorite?: boolean)`**

- **Estados**: isFavorite, loading, error
- **Acciones**: toggle()
- **Uso**: Botones de favorito

### **`useExerciseDetail(exerciseId: string)`**

- **Propósito**: Hook combinado para página de detalle
- **Incluye**: Todos los datos necesarios
- **Estados**: isAuthenticated, isLoading, hasAnyData
- **Uso**: ExerciseDetailView

---

## **🔒 SEGURIDAD**

### **Row Level Security (RLS)**

- ✅ Todas las tablas de usuario tienen RLS habilitado
- ✅ Políticas automáticas por `user_id = auth.uid()`
- ✅ No se pueden acceder datos de otros usuarios

### **Validación de Parámetros**

- ✅ UUIDs validados por Supabase
- ✅ Tipos TypeScript estrictos
- ✅ Manejo de errores consistente

### **Autenticación**

- ✅ Hooks verifican `user.id` antes de llamadas
- ✅ Estados de loading durante verificación
- ✅ Redirección automática si no autenticado

---

## **📊 FLUJO DE DATOS**

### **Página de Catálogo**

```
useExercises() → getExercises(userId) →
  ↓
getExercisesWithUserData() →
  ↓
[Exercise + is_favorite + user_stats]
```

### **Página de Detalle**

```
useExerciseDetail(exerciseId) →
  ├── useExerciseRecords() → getExerciseRecords()
  ├── useExerciseStats() → getExerciseStats()
  └── useExerciseProgress() → getExerciseProgress()
```

### **Toggle Favorito**

```
useExerciseFavorite() → toggle() →
  ↓
toggleExerciseFavorite() →
  ↓
[Actualización automática en UI]
```

---

## **🚀 PERFORMANCE**

### **Optimizaciones Implementadas**

- ✅ **Lazy loading**: Imports dinámicos para user-exercises
- ✅ **Parallel queries**: Promise.all para datos relacionados
- ✅ **Índices SQL**: Optimizados para consultas frecuentes
- ✅ **Caching**: Estados locales en hooks
- ✅ **Selective loading**: Solo datos necesarios por contexto

### **Métricas Esperadas**

- **getExercises()**: ~200ms (sin usuario), ~400ms (con datos)
- **getExerciseById()**: ~150ms (básico), ~300ms (con stats)
- **toggleFavorite()**: ~100ms
- **getExerciseProgress()**: ~250ms (6 meses de datos)

---

## **🔄 INTEGRACIÓN CON FRONTEND**

### **Estados Manejados**

- ✅ **Loading states**: Skeletons durante carga
- ✅ **Empty states**: Mensajes cuando no hay datos
- ✅ **Error states**: Manejo graceful de errores
- ✅ **Authentication states**: Redirección automática

### **Componentes Conectados**

- `ExerciseCatalog` → `useExercises()`
- `ExerciseDetailView` → `useExerciseDetail()`
- `ExerciseRecords` → `useExerciseRecords()`
- `ExerciseProgressChart` → `useExerciseProgress()`
- `FavoriteButton` → `useExerciseFavorite()`

---

## **📈 PRÓXIMAS EXTENSIONES**

### **APIs Pendientes** (Para módulo Training)

- `createWorkoutSession()`
- `addExerciseSet()`
- `updateExerciseSet()`
- `completeWorkoutSession()`

### **Hooks Futuros**

- `useWorkoutSession()`
- `useExerciseTimer()`
- `useRestTimer()`

---

## **✅ TESTING**

### **Casos de Prueba Cubiertos**

- ✅ Usuario autenticado vs no autenticado
- ✅ Datos existentes vs datos vacíos
- ✅ Errores de red y base de datos
- ✅ Estados de loading y transiciones
- ✅ Operaciones CRUD de favoritos

### **Datos Mock Disponibles**

- ✅ Scripts SQL con datos de ejemplo
- ✅ Triggers automáticos funcionando
- ✅ RLS policies validadas

---

**🎯 ESTADO: LISTO PARA PRODUCCIÓN**

Todas las APIs están implementadas, documentadas y listas para integración con los componentes frontend existentes.
