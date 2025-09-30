'use client'

import { ArrowLeft, Calendar, CheckCircle, Edit, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import CloseIncidentDialog from '@/components/incident/close-incident-dialog'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { handleDomainError } from '@/lib/error-handler'
import { api } from '@/trpc/react'

export default function IncidentDetailPage() {
  const params = useParams()
  const incidentId = params.id as string
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const {
    data: incident,
    isLoading,
    error,
    refetch
  } = api.incidents.getIncidentById.useQuery({ id: incidentId }, { enabled: !!incidentId })

  const updateIncidentMutation = api.incidents.updateIncident.useMutation({
    onSuccess: () => {
      toast.success('Incidencia actualizada con éxito')
      refetch()
      setIsUpdating(false)
    },
    onError: (error) => {
      handleDomainError(error)
      setIsUpdating(false)
    }
  })

  const handleStatusChange = (newStatus: 'open' | 'closed') => {
    if (!incident) return

    if (newStatus === 'closed') {
      setIsCloseDialogOpen(true)
    } else {
      setIsUpdating(true)
      updateIncidentMutation.mutate({
        ...incident,
        status: newStatus,
        endAt: undefined
      })
    }
  }

  const handleCloseDialogSuccess = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando incidencia...</div>
        </div>
      </PageContainer>
    )
  }

  if (error || !incident) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          {error ? `Error al cargar la incidencia: ${error.message}` : 'Incidencia no encontrada'}
        </div>
      </PageContainer>
    )
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLocationText = () => {
    if (incident.waterPointId) return 'Punto de Agua'
    if (incident.waterDepositId) return 'Depósito de Agua'
    if (incident.communityZoneId) return 'Zona de Agua'
    return 'Comunidad'
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Back Button */}
          <div>
            <Link href="/incident">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Incidencias
              </Button>
            </Link>
          </div>

          {/* Title and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{incident.title}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  Reportado por {incident.reporterName}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {incident.status === 'open' && (
                <Button
                  onClick={() => handleStatusChange('closed')}
                  disabled={isUpdating}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Cerrar Incidencia
                </Button>
              )}
              {incident.status === 'closed' && (
                <Button
                  onClick={() => handleStatusChange('open')}
                  disabled={isUpdating}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Reabriendo...' : 'Reabrir Incidencia'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción Original</CardTitle>
              </CardHeader>
              <CardContent>
                {incident.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {incident.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No se proporcionó descripción</p>
                )}
              </CardContent>
            </Card>

            {/* Closing Description */}
            {incident.status === 'closed' && incident.closingDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción de Cierre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {incident.closingDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Cronología</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Incidencia Creada</p>
                    <p className="text-sm text-muted-foreground">{formatDate(incident.startAt)}</p>
                  </div>
                </div>

                {incident.endAt && (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Incidencia Cerrada</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(incident.endAt)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Incidencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reportero</p>
                    <p className="text-sm text-muted-foreground">{incident.reporterName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha de Inicio</p>
                    <p className="text-sm text-muted-foreground">{formatDate(incident.startAt)}</p>
                  </div>
                </div>

                {incident.endAt && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Fin</p>
                      <p className="text-sm text-muted-foreground">{formatDate(incident.endAt)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">{getLocationText()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
                  {incident.status === 'open' && (
                    <Button
                      onClick={() => handleStatusChange('closed')}
                      disabled={isUpdating}
                      size="sm"
                      variant="outline"
                    >
                      Cerrar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Close Incident Dialog */}
      {incident && (
        <CloseIncidentDialog
          incident={incident}
          open={isCloseDialogOpen}
          onOpenChange={setIsCloseDialogOpen}
          onSuccess={handleCloseDialogSuccess}
        />
      )}
    </PageContainer>
  )
}
