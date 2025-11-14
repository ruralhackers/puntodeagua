'use client'

import { AlertTriangle, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import IncidentActions from './_components/incident-actions'

export default function IncidentsPage() {
  const user = useUserStore((state) => state.user)
  const router = useRouter()
  const communityId = user?.community?.id
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyOpen, setShowOnlyOpen] = useState(true)

  const {
    data: incidents,
    isLoading,
    error
  } = api.incidents.getIncidentsByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  const filteredIncidents = useMemo(() => {
    let filtered = incidents || []

    // Filter by status if active
    if (showOnlyOpen) {
      filtered = filtered.filter((i) => i.status === 'open')
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((i) => {
        const locationText = i.waterPointId
          ? 'punto de agua'
          : i.waterDepositId
            ? 'depósito de agua'
            : i.communityZoneId
              ? 'zona de agua'
              : 'comunidad'
        return (
          i.title.toLowerCase().includes(searchLower) ||
          i.description?.toLowerCase().includes(searchLower) ||
          locationText.includes(searchLower)
        )
      })
    }

    return filtered
  }, [incidents, showOnlyOpen, searchTerm])

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
          <div className="text-muted-foreground">Cargando incidencias...</div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          Error al cargar las incidencias: {error.message}
        </div>
      </PageContainer>
    )
  }

  const openCount = incidents?.filter((i) => i.status === 'open').length || 0
  const totalCount = incidents?.length || 0

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLocationText = (incident: (typeof incidents)[number]) => {
    if (incident.waterPointId) return 'Punto de Agua'
    if (incident.waterDepositId) return 'Depósito de Agua'
    if (incident.communityZoneId) return 'Zona de Agua'
    return 'Comunidad'
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'closed':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Incidencias</h1>
            <p className="text-muted-foreground">
              Tenemos {totalCount} {totalCount === 1 ? 'incidencia' : 'incidencias'}, de las cuales{' '}
              {openCount} {openCount === 1 ? 'está abierta' : 'están abiertas'}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/incident/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Incidencia
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
                    placeholder="Buscar por título, descripción o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="show-open" checked={showOnlyOpen} onCheckedChange={setShowOnlyOpen} />
                <Label htmlFor="show-open" className="cursor-pointer whitespace-nowrap">
                  Solo abiertas
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {filteredIncidents.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/incident/${incident.id}`)}
                  >
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>{incident.reporterName}</TableCell>
                    <TableCell>{formatDate(incident.startAt)}</TableCell>
                    <TableCell>{getLocationText(incident)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(incident.status)}>
                        {incident.status === 'open' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <IncidentActions incident={incident} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron incidencias</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? 'No hay incidencias que coincidan con tu búsqueda'
                  : showOnlyOpen
                    ? 'No hay incidencias abiertas'
                    : 'Aún no se han reportado incidencias'}
              </p>
              {!searchTerm && incidents?.length === 0 && (
                <Button asChild>
                  <Link href="/incident/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Reportar Primera Incidencia
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
