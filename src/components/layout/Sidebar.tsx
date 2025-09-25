'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button, Avatar } from '@/components/ui'
import { useAuth } from '@/hooks'
import { WorkoutTimer } from '@/components/workout'
import { 
  Home, 
  Calendar, 
  Play, 
  Dumbbell, 
  TrendingUp, 
  User, 
  Settings,
  X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-sky-400' },
  { name: 'Rutinas', href: '/routines', icon: Calendar, color: 'text-amber-400' },
  { name: 'Entrenar', href: '/training', icon: Play, color: 'text-emerald-400' },
  { name: 'Ejercicios', href: '/exercises', icon: Dumbbell, color: 'text-violet-400' },
  { name: 'Progreso', href: '/progress', icon: TrendingUp, color: 'text-blue-400' },
  { name: 'Perfil', href: '/profile', icon: User, color: 'text-pink-400' },
  { name: 'Configuración', href: '/settings', icon: Settings, color: 'text-cyan-400' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col border-r border-border-primary">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-accent-primary">GymApp</h1>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent pathname={pathname} />
      </div>
    </>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  const { isAuthenticated, profile } = useAuth()
  
  
  // Training state - TODO: implement real training state
  const isTraining = false

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background-secondary px-4 pb-4">
      {/* Logo - reserved space for future logo */}
      <div className="flex h-16 shrink-0 items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
          <span className="text-accent-primary font-bold text-lg">G</span>
        </div>
        <h1 className="text-xl font-bold text-accent-primary">GymApp</h1>
      </div>


      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors",
                        isActive
                          ? "text-white hover:bg-white/10"
                          : "text-text-secondary hover:bg-white/10 hover:text-text-primary"
                      )}
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent ring-0 transition-all duration-150 group-hover:bg-white/10 group-hover:ring-1 group-hover:ring-white/10">
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-colors text-text-tertiary group-hover:text-text-secondary"
                        )} />
                      </span>
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Bottom section */}
          <li className="mt-auto">
            <div className="space-y-4">
              {/* Training status */}
              {isTraining ? (
                <div className="rounded-lg bg-accent-primary/10 p-4 ring-1 ring-accent-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-accent-primary">Entrenando</p>
                      <p className="text-xs text-text-tertiary">Pecho y Tríceps • 45 min</p>
                    </div>
                    <Button size="sm" className="h-8">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* User Profile Section - Show below Configuration when authenticated */}
              {isAuthenticated ? (
                <div className="rounded-lg bg-background-tertiary/50 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      size="sm" 
                      src={profile?.avatar_url || undefined}
                      alt={profile?.full_name || profile?.username || 'Usuario'}
                      fallback={profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {profile?.full_name || profile?.username || 'Usuario'}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Nivel: {profile?.experience_level === 'beginner' ? 'Principiante' : 
                               profile?.experience_level === 'intermediate' ? 'Intermedio' : 
                               profile?.experience_level === 'advanced' ? 'Avanzado' : 'Principiante'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* User section */}
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-background-tertiary/50 p-4">
                    <h3 className="text-sm font-medium text-text-primary mb-2">¡Bienvenido a GymApp!</h3>
                    <p className="text-xs text-text-secondary mb-3">
                      Inicia sesión para acceder a todas las funcionalidades
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href="/auth/login">Iniciar Sesión</Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-text-primary">Comenzar</h4>
                    <p className="text-xs text-text-tertiary">
                      Explora rutinas y ejercicios disponibles
                    </p>
                    <div className="space-y-2">
                      <Link href="/exercises" className="block">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                          Ver Ejercicios
                        </Button>
                      </Link>
                      <Link href="/routines" className="block">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                          Rutinas Populares
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}
