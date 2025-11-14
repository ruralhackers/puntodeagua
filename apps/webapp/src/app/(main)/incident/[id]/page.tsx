'use client'

import { AlertTriangle, ArrowLeft, Calendar, Check, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import CloseIncidentDialog from '@/components/incident/close-incident-dialog'
import { IncidentImageGallery } from '@/components/incident-image-gallery'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { handleDomainError } from '@/lib/error-handler'
import { api } from '@/trpc/react'

export default function IncidentDetailPage() {
  const params = useParams()
  const incidentId = params.id as string
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const {
    data: incident,
    isLoading,
    refetch
  } = api.incidents.getIncidentById.useQuery({ id: incidentId }, { enabled: !!incidentId })

  const deleteImageMutation = api.incidents.deleteIncidentImage.useMutation({
    onSuccess: () => {
      toast.success('Imagen eliminada con éxito')
      refetch()
    },
    onError: (error) => {
      handleDomainError(error)
    }
  })

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando incidencia...</div>
        </div>
      </PageContainer>
    )
  }

  if (!incident) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">Incidencia no encontrada</div>
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

  const handleCloseSuccess = () => {
    refetch()
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/incident">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{incident.title}</h1>
            <Badge variant={getStatusVariant(incident.status)} className="mt-2">
              {incident.status === 'open' ? 'Abierta' : 'Cerrada'}
            </Badge>
          </div>
          {incident.status === 'open' && (
            <Button
              onClick={() => setIsCloseDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Cerrar Incidencia
            </Button>
          )}
        </div>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Detalles de la Incidencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Reportado por</p>
                  <p className="text-sm text-muted-foreground">{incident.reporterName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fecha de inicio</p>
                  <p className="text-sm text-muted-foreground">{formatDate(incident.startAt)}</p>
                </div>
              </div>

              {incident.endAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fecha de cierre</p>
                    <p className="text-sm text-muted-foreground">{formatDate(incident.endAt)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">
                    {incident.waterPointId
                      ? 'Punto de Agua'
                      : incident.waterDepositId
                        ? 'Depósito de Agua'
                        : incident.communityZoneId
                          ? 'Zona de Agua'
                          : 'Comunidad'}
                  </p>
                </div>
              </div>
            </div>

            {incident.description && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Descripción</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>
            )}

            {incident.closingDescription && (
              <div className="pt-4 border-t bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2 text-green-800">Descripción de cierre</p>
                <p className="text-sm text-green-700 whitespace-pre-wrap">
                  {incident.closingDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images Card */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentImageGallery
              images={incident.images || []}
              onDeleteImage={(imageId) => deleteImageMutation.mutate({ imageId })}
              canDelete={incident.status === 'open'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Close Dialog */}
      <CloseIncidentDialog
        incident={incident}
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onSuccess={handleCloseSuccess}
      />
    </PageContainer>
  )
}
