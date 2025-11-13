'use client'

import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import ProviderActions from './_components/provider-actions'
import ProviderTypeBadge from './_components/provider-type-badge'

export default function ProvidersPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyActive, setShowOnlyActive] = useState(true)

  const {
    data: providers,
    isLoading,
    error
  } = api.providers.getProvidersByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  const filteredProviders = useMemo(() => {
    let filtered = providers || []

    // Filtrar por activos si está activado
    if (showOnlyActive) {
      filtered = filtered.filter((p) => p.isActive)
    }

    // Filtrar por texto de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.companyName.toLowerCase().includes(searchLower) ||
          p.contactPhone.includes(searchTerm) ||
          p.contactPerson.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [providers, showOnlyActive, searchTerm])

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

  const activeCount = providers?.filter((p) => p.isActive).length || 0
  const totalCount = providers?.length || 0

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">
              Tenemos {totalCount} {totalCount === 1 ? 'proveedor' : 'proveedores'}, de los cuales{' '}
              {activeCount} {activeCount === 1 ? 'está activo' : 'están activos'}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/provider/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Link>
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, teléfono o persona de contacto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-active"
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                />
                <Label htmlFor="show-active" className="cursor-pointer whitespace-nowrap">
                  Solo activos
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {filteredProviders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.companyName}</TableCell>
                    <TableCell>{provider.contactPhone}</TableCell>
                    <TableCell>
                      <ProviderTypeBadge providerType={provider.providerType} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                        {provider.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ProviderActions provider={provider} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron proveedores</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? 'No hay proveedores que coincidan con tu búsqueda'
                  : showOnlyActive
                    ? 'No hay proveedores activos'
                    : 'Aún no se han registrado proveedores'}
              </p>
              {!searchTerm && providers?.length === 0 && (
                <Button asChild>
                  <Link href="/provider/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primer Proveedor
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
