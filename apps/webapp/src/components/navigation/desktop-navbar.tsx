'use client'

import { FileText, Home, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '../../features/auth/context/auth-context'

export function DesktopNavbar() {
  const { logout, user } = useAuth()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  // Helper function to check if user can see "Más" section
  const canSeeMore = () => {
    return user?.roles.includes('COMMUNITY_ADMIN') || user?.roles.includes('SUPER_ADMIN') || false
  }

  const navigationItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: Home,
      active: pathname === '/'
    },
    {
      href: '/dashboard/registros',
      label: 'Registros',
      icon: FileText,
      active: pathname.includes('/dashboard/registros')
    },
    // Only show "Más" if user is community_admin
    ...(canSeeMore()
      ? [
          {
            href: '/dashboard/mas',
            label: 'Más',
            icon: Menu,
            active: pathname.includes('/dashboard/mas')
          }
        ]
      : [])
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-blue-600">Punto de Agua</h1>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'flex items-center gap-2 text-gray-600 hover:text-gray-900',
                item.active && 'text-blue-600 bg-blue-50'
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            </Button>
          ))}

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:cursor-pointer ml-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
