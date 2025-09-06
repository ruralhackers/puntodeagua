'use client'

import { UserRole } from 'core'
import Link from 'next/link'
import { useAuth } from '@/src/features/auth/context/auth-context'

export default function MasPage() {
  const { user } = useAuth()

  const canSeePrivateItems = () => {
    return user?.roles.includes('COMMUNITY_ADMIN') || user?.roles.includes('SUPER_ADMIN') || false
  }

  const privateMenuItems = [
    {
      title: 'Usuarios',
      description: 'Administra los usuarios del sistema',
      href: '/dashboard/usuarios',
      icon: '👥',
      role: UserRole.COMMUNITY_ADMIN
    },
    {
      title: 'Contadores',
      description: 'Gestiona contadores y puntos de agua',
      href: '/dashboard/registros/contadores',
      icon: '💧',
      role: UserRole.COMMUNITY_ADMIN
    },
    {
      title: 'Proveedores',
      description: 'Gestiona los proveedores del sistema',
      icon: '🏪',
      href: '/dashboard/proveedores',
      color: 'text-emerald-600',
      role: UserRole.COMMUNITY_ADMIN
    },
    {
      title: 'Comparte tus registros',
      description: 'Comparte analíticas, incidencias y mantenimientos',
      icon: '📖',
      href: '/compartir-datos',
      color: 'text-emerald-600',
      role: UserRole.COMMUNITY_ADMIN
    },
    {
      title: 'Crear Recordatorio',
      description: 'Programa recordatorios para registros',
      href: '/dashboard/recordatorios/nuevo',
      icon: '⏰',
      disabled: true,
      role: UserRole.COMMUNITY_ADMIN
    }
  ]

  const publicMenuItems = [
    {
      title: 'Cerrar sesión',
      description: 'Cierra la sesión para volver a iniciar con la misma cuenta o con otra distinta',
      href: '/dashboard/logout',
      icon: '👋'
    }
  ]

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-6">Más opciones</h1>

      <div className="space-y-3">
        {/* Private menu items - only shown if user has appropriate role */}
        {canSeePrivateItems() &&
          privateMenuItems.map((item) => (
            <Link
              key={item.disabled ? 'disabled' : item.href}
              href={item.disabled ? '#' : item.href}
              className={`block p-4 bg-white rounded-lg border border-gray-200 transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            </Link>
          ))}

        {/* Public menu items - always shown */}
        {publicMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-4 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
