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
