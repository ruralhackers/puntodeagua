'use client'

import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import ProviderCard from './_components/provider-card'

export default function ProvidersPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id

  const {
    data: providers,
    isLoading,
    error
  } = api.providers.getProvidersByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  if (!communityId) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          No se pudo determinar la comunidad del usuario
        </div>
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando proveedores...</div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          Error al cargar los proveedores: {error.message}
        </div>
      </PageContainer>
    )
  }

  const activeProviders = providers?.filter((provider) => provider.isActive) || []
  const inactiveProviders = providers?.filter((provider) => !provider.isActive) || []

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestiona los proveedores de servicios de tu comunidad
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/provider/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
              <Badge variant="default" className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeProviders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores Inactivos</CardTitle>
              <Badge variant="secondary" className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {inactiveProviders.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Providers */}
        {activeProviders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Proveedores Activos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Providers */}
        {inactiveProviders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Proveedores Inactivos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {providers?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron proveedores en tu comunidad
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Aún no se han registrado proveedores en tu comunidad.
              </p>
              <Button asChild>
                <Link href="/provider/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Proveedor de tu comunidad
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
