'use client'

import { Mail, MoreVertical, Plus, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { useAuth } from '@/src/features/auth/context/auth-context'
import { GetUsersQry } from '@/src/features/user/application/get-users.qry'

interface UserData {
  id: string
  email: string
  name: string | null
  roles: string[]
  communityId: string | null
  emailVerified: Date | null
  image: string | null
}

export function UsersPage() {
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // Use useUseCase for data fetching
  const { data: usersData, isLoading, execute } = useUseCase(GetUsersQry)

  // Check permissions
  const hasAccess = user?.roles.includes('COMMUNITY_ADMIN') || user?.roles.includes('SUPER_ADMIN')

  useEffect(() => {
    if (authLoading) return

    if (!hasAccess) {
      router.push('/dashboard')
      return
    }

    if (!token) return

    // Execute the query to load users with token
    execute({ token })
  }, [authLoading, hasAccess, token, execute, router])

  const getRolColor = (roles: string[]) => {
    if (roles.includes('SUPER_ADMIN')) return 'bg-red-100 text-red-800'
    if (roles.includes('COMMUNITY_ADMIN')) return 'bg-red-100 text-red-800'
    if (roles.includes('MANAGER')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getRolLabel = (roles: string[]) => {
    if (roles.includes('SUPER_ADMIN')) return 'Super Admin'
    if (roles.includes('COMMUNITY_ADMIN')) return 'Administrador'
    if (roles.includes('MANAGER')) return 'Operario'
    return 'Usuario'
  }

  // Show loading while checking auth or loading data
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  // Don't show anything if no access (will redirect)
  if (!hasAccess) {
    return null
  }

  // Show empty state if no data
  if (!usersData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    )
  }

  const filteredUsuarios = usersData.users.filter(
    (usuario: UserData) =>
      usuario.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button asChild className="whitespace-nowrap">
            <Link href="/dashboard/usuarios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{usersData.statistics.total}</div>
            <div className="text-sm text-gray-600">Total usuarios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{usersData.statistics.active}</div>
            <div className="text-sm text-gray-600">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {usersData.statistics.administrators}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {usersData.statistics.operators}
            </div>
            <div className="text-sm text-gray-600">Operarios</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3">
        {filteredUsuarios.map((usuario: UserData) => (
          <Card key={usuario.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{usuario.name || 'Sin nombre'}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRolColor(usuario.roles)}`}
                      >
                        {getRolLabel(usuario.roles)}
                      </span>
                      {!usuario.emailVerified && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          No verificado
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {usuario.email}
                      </div>
                      <div className="text-xs text-gray-500">ID: {usuario.id}</div>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No se encontraron usuarios</p>
        </div>
      )}
    </div>
  )
}
