'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '../../features/auth/context/auth-context'

export function DesktopNavbar() {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-blue-600">Punto de Agua</h1>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </nav>
  )
}
