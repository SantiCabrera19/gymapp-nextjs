'use client'

import { Search, Bell, Menu, LogOut, User } from 'lucide-react'
import { Button, Avatar, SearchBar, HeaderProfileSkeleton } from '@/components/ui'
import { useAuth } from '@/hooks'
import { signOut } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated, profile, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-50 border-b border-border-primary bg-background-secondary/90 backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-background-secondary/80 shadow-sm">
      <div className="flex h-16 items-center gap-3 px-5 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search bar */}
        <div className="flex-1 max-w-md">
          <SearchBar placeholder="Buscar ejercicios, rutinas..." />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          {loading ? (
            <HeaderProfileSkeleton />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Avatar 
                size="sm" 
                src={profile?.avatar_url || undefined}
                alt={profile?.full_name || profile?.username || 'Usuario'}
                fallback={profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-text-primary">
                  {profile?.full_name || profile?.username || 'Usuario'}
                </p>
                <p className="text-xs text-text-tertiary">
                  {profile?.email || 'usuario@email.com'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="/auth/login">Iniciar Sesión</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/auth/register">Registrarse</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
