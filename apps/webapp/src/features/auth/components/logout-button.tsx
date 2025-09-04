'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '../context/auth-context'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  children
}: LogoutButtonProps) {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || (
        <>
          <span className="hidden sm:inline">Cerrar sesión</span>
          <span className="sm:hidden">Salir</span>
        </>
      )}
    </Button>
  )
}

export default LogoutButton
