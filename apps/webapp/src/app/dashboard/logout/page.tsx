'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/src/features/auth/context/auth-context'

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    logout()
    router.push('/login')
  }, [logout, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Cerrando sesión...</h1>
        <p className="text-gray-600">Te estamos redirigiendo a la página de inicio de sesión.</p>
      </div>
    </div>
  )
}
