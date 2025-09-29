import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pulse' | 'wave' | 'shimmer'
}

export function Skeleton({ className, variant = 'pulse', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-700/50 via-gray-600/70 to-gray-700/50",
        className
      )}
      {...props}
    />
  )
}

// Skeleton específicos para diferentes componentes
export function CardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="rounded-lg border border-border-primary bg-background-secondary p-6"
      style={{ 
        animation: `fadeIn 0.6s ease-out ${delay}ms both`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-3/5" />
        <div className="pt-2">
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="rounded-lg bg-background-tertiary/50 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function HeaderProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      {/* Cards grid skeleton with staggered animation */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton delay={0} />
        <CardSkeleton delay={150} />
        <CardSkeleton delay={300} />
      </div>
      
      {/* Secondary grid skeleton */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        <CardSkeleton delay={450} />
        <CardSkeleton delay={600} />
      </div>
    </div>
  )
}

// Skeleton para elementos de navegación
export function NavItemSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="h-5 w-5 rounded-sm" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// Skeleton para contenido completo de página
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background-primary animate-fade-in">
      {/* Header skeleton */}
      <div className="h-16 bg-background-secondary border-b border-border-primary flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Skeleton variant="pulse" className="h-6 w-6" />
          <Skeleton variant="shimmer" className="h-8 w-64" />
        </div>
        <HeaderProfileSkeleton />
      </div>
      
      {/* Main content */}
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="w-64 bg-background-secondary min-h-screen p-4 space-y-6">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <NavItemSkeleton key={i} delay={i * 50} />
            ))}
          </div>
          <div className="mt-auto pt-8">
            <ProfileSkeleton />
          </div>
        </div>
        
        {/* Page content */}
        <div className="flex-1 p-8">
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Skeleton específico para Exercise Cards
export function ExerciseCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="rounded-lg border border-border-primary bg-background-tertiary p-4"
      style={{ 
        animation: `fadeIn 0.4s ease-out ${delay}ms both`
      }}
    >
      {/* Image placeholder */}
      <div className="aspect-video mb-3 bg-gradient-to-br from-gray-700/30 via-gray-600/50 to-gray-700/30 rounded-md animate-pulse" />
      
      {/* Title */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      
      {/* Muscle group */}
      <Skeleton className="h-4 w-1/2 mb-3" />
      
      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Button */}
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  )
}

// Skeleton para grid de ejercicios
export function ExerciseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ExerciseCardSkeleton key={i} delay={i * 100} />
      ))}
    </div>
  )
}

// Skeleton para filtros
export function FiltersSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-background-tertiary rounded-lg border border-border-primary">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton específico para página de perfil
export function ProfilePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-700/50 rounded-md w-48" />
        <div className="h-4 bg-gray-600/70 rounded w-96" />
      </div>

      {/* Avatar Section */}
      <div className="p-6 bg-background-secondary rounded-lg border border-border-primary">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-700/50 rounded w-40" />
            <div className="h-4 bg-gray-600/70 rounded w-56" />
            <div className="flex gap-3">
              <div className="h-8 bg-gray-700/50 rounded w-24" />
              <div className="h-8 bg-gray-600/70 rounded w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <div className="p-6 bg-background-secondary rounded-lg border border-border-primary space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-48" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-600/70 rounded w-24" />
              <div className="h-10 bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>

        {/* Physical Data */}
        <div className="p-6 bg-background-secondary rounded-lg border border-border-primary space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-600/70 rounded w-20" />
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-700/50 rounded" />
                <div className="w-20 h-10 bg-gray-600/70 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="p-6 bg-background-secondary rounded-lg border border-border-primary space-y-6">
        <div className="h-6 bg-gray-700/50 rounded w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-700/50 rounded" />
          ))}
        </div>
      </div>

      {/* Save Actions */}
      <div className="p-6 bg-background-secondary rounded-lg border border-border-primary">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-600/70 rounded w-48" />
          <div className="flex gap-3">
            <div className="h-10 bg-gray-600/70 rounded w-24" />
            <div className="h-10 bg-gray-700/50 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
