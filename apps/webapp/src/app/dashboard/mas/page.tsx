'use client'

import { Calendar, Droplets, Store, Users } from 'lucide-react'
import Link from 'next/link'

export default function MasPage() {
  const menuItems = [
    {
      title: 'Usuarios',
      description: 'Administra los usuarios del sistema',
      href: '/dashboard/usuarios',
      icon: '👥'
    },
    {
      title: 'Contadores',
      description: 'Gestiona contadores y puntos de agua',
      href: '/dashboard/registros/contadores',
      icon: '💧'
    },
    {
      title: 'Proveedores',
      description: 'Gestiona los proveedores del sistema',
      icon: '🏪',
      href: '/dashboard/proveedores',
      color: 'text-emerald-600'
    },
    {
      title: 'Crear Recordatorio',
      description: 'Programa recordatorios para registros',
      href: '/dashboard/recordatorios/nuevo',
      icon: '⏰',
      disabled: true
    }
  ]

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-6">Más opciones</h1>

      <div className="space-y-3">
        {menuItems.map((item) => (
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
      </div>
    </div>
  )
}
