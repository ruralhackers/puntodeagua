'use client'

import { Calendar, Droplets, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/src/features/auth/context/auth-context'

export default function MasPage() {
  const { user, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  // Check if user has permission to access this page
  const hasAccess = user?.roles.includes('COMMUNITY_ADMIN') || user?.roles.includes('SUPER_ADMIN')

  if (!hasAccess) {
    redirect('/dashboard')
  }

  const options = [
    {
      title: 'Usuarios',
      description: 'Administra los usuarios del sistema',
      icon: Users,
      href: '/dashboard/usuarios',
      color: 'text-blue-600'
    },
    {
      title: 'Contadores',
      description: 'Gestiona contadores y puntos de agua',
      icon: Droplets,
      href: '/dashboard/contadores',
      color: 'text-cyan-600'
    },
    {
      title: 'Crear Recordatorio',
      description: 'Programa recordatorios para registros',
      icon: Calendar,
      href: '/dashboard/recordatorios/nuevo',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Más opciones</h1>
        <p className="text-gray-600">Herramientas adicionales de administración</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <Link key={option.href} href={option.href}>
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${option.color}`}>
                    <option.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{option.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
