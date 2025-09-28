'use client'

import { ArrowLeft, Calendar, CheckCircle, Edit, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/trpc/react'

export default function IssueDetailPage() {
  const params = useParams()
  const issueId = params.id as string
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    data: issue,
    isLoading,
    error,
    refetch
  } = api.issues.getIssueById.useQuery({ id: issueId }, { enabled: !!issueId })

  const updateIssueMutation = api.issues.updateIssue.useMutation({
    onSuccess: () => {
      toast.success('Incidencia actualizada con éxito')
      refetch()
      setIsUpdating(false)
    },
    onError: (error) => {
      toast.error('Error al actualizar la incidencia: ' + error.message)
      setIsUpdating(false)
    }
  })

  const handleStatusChange = (newStatus: 'open' | 'closed') => {
    if (!issue) return

    setIsUpdating(true)
    updateIssueMutation.mutate({
      ...issue,
      status: newStatus,
      endAt: newStatus === 'closed' ? new Date() : undefined
    })
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

  if (error || !issue) {
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
    if (issue.waterPointId) return 'Punto de Agua'
    if (issue.waterDepositId) return 'Depósito de Agua'
    if (issue.waterZoneId) return 'Zona de Agua'
    return 'Comunidad'
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Back Button */}
          <div>
            <Link href="/issue">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Incidencias
              </Button>
            </Link>
          </div>

          {/* Title and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{issue.title}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  Reportado por {issue.reporterName}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {issue.status === 'open' && (
                <Button
                  onClick={() => handleStatusChange('closed')}
                  disabled={isUpdating}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Cerrando...' : 'Cerrar Incidencia'}
                </Button>
              )}
              {issue.status === 'closed' && (
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
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                {issue.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No se proporcionó descripción</p>
                )}
              </CardContent>
            </Card>

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
                    <p className="text-sm text-muted-foreground">{formatDate(issue.startAt)}</p>
                  </div>
                </div>

                {issue.endAt && (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Incidencia Cerrada</p>
                        <p className="text-sm text-muted-foreground">{formatDate(issue.endAt)}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Incidencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reportero</p>
                    <p className="text-sm text-muted-foreground">{issue.reporterName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha de Inicio</p>
                    <p className="text-sm text-muted-foreground">{formatDate(issue.startAt)}</p>
                  </div>
                </div>

                {issue.endAt && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Fin</p>
                      <p className="text-sm text-muted-foreground">{formatDate(issue.endAt)}</p>
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
                  <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                  {issue.status === 'open' && (
                    <Button
                      onClick={() => handleStatusChange('closed')}
                      disabled={isUpdating}
                      size="sm"
                      variant="outline"
                    >
                      {isUpdating ? 'Cerrando...' : 'Cerrar'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
