'use client'

import type { WaterMeterReadingImageDto } from '@pda/water-account'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Droplets,
  Edit,
  FileText,
  MapPin,
  Plus,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import { ConsumptionCalculation } from '../_components/consumption-calculation'
import { AddReadingModal } from '../new/_components/add-reading-modal'
import { EditReadingModal } from './_components/edit-reading-modal'

export default function WaterMeterDetailPage() {
  const params = useParams()
  const waterMeterId = params.id as string
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addReadingModalOpen, setAddReadingModalOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<{
    id: string
    reading: string
    notes: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  } | null>(null)

  const {
    data: waterMeter,
    isLoading: meterLoading,
    error: meterError
  } = api.waterAccount.getWaterMeterById.useQuery({ id: waterMeterId }, { enabled: !!waterMeterId })

  const {
    data: readings,
    isLoading: readingsLoading,
    error: readingsError
  } = api.waterAccount.getWaterMeterReadings.useQuery({ waterMeterId }, { enabled: !!waterMeterId })

  const user = useUserStore((state) => state.user)

  const waterLimitRule = user?.community?.waterLimitRule

  const utils = api.useUtils()

  const recalculateExcessMutation = api.waterAccount.recalculateWaterMeterExcess.useMutation({
    onSuccess: () => {
      toast.success('Exceso recalculado correctamente')
      utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })
    },
    onError: (error) => {
      toast.error('Error al recalcular el exceso', {
        description: error.message
      })
    }
  })

  const handleEditReading = (reading: {
    id: string
    reading: string
    notes: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  }) => {
    setEditingReading(reading)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    // Invalidate both queries to refresh the data
    utils.waterAccount.getWaterMeterReadings.invalidate({ waterMeterId })
    utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })
  }

  const handleRecalculateExcess = () => {
    recalculateExcessMutation.mutate({ waterMeterId })
  }

  if (meterLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          {/* Loading skeleton for back button and header */}
          <div className="flex items-center gap-4">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Loading skeleton for content */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  if (meterError) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <h2 className="text-lg font-semibold mb-2">Error al cargar el contador</h2>
                <p>{meterError.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  if (!waterMeter) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <h2 className="text-lg font-semibold mb-2">Contador no encontrado</h2>
                <p>El contador solicitado no existe o no tienes permisos para verlo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  const getStatusBadge = () => {
    if (!waterMeter.lastReadingDate) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Sin lectura
        </Badge>
      )
    }

    if (waterMeter.lastReadingExcessConsumption) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Exceso de consumo
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Consumo normal
      </Badge>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left side: Info */}
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {waterMeter.waterAccountName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="truncate">{waterMeter.waterPoint.name}</span>
              <span>•</span>
              {getStatusBadge()}
            </div>
          </div>

          {/* Right side: Action button */}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 self-start"
            onClick={() => setAddReadingModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Lectura
          </Button>
        </div>

        {/* Water Meter Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              Información del Contador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Last Reading */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Última Lectura
                </h3>
                {waterMeter.lastReadingDate ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {waterMeter.lastReadingNormalizedValue?.toLocaleString('es-ES')} L
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(waterMeter.lastReadingDate), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    {waterMeter.lastReadingExcessConsumption && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Exceso
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRecalculateExcess}
                      disabled={recalculateExcessMutation.isPending}
                      className="mt-2"
                    >
                      <RefreshCw
                        className={`h-3 w-3 mr-1 ${recalculateExcessMutation.isPending ? 'animate-spin' : ''}`}
                      />
                      Recalcular Exceso
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">Sin lecturas</div>
                )}
              </div>

              {/* Water Point */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Punto de Agua
                </h3>
                <div className="space-y-1">
                  <div className="font-medium">{waterMeter.waterPoint.name}</div>
                  <div className="text-sm text-gray-600">{waterMeter.waterPoint.location}</div>
                  <div className="text-sm text-gray-500">
                    {waterMeter.waterPoint.fixedPopulation +
                      waterMeter.waterPoint.floatingPopulation}{' '}
                    personas
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/water-point/${waterMeter.waterPoint.id}`}>
                    <MapPin className="h-3 w-3 mr-1" />
                    Ver Punto
                  </Link>
                </Button>
              </div>

              {/* Technical Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Información Técnica
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Unidad: </span>
                    <span className="font-mono">{waterMeter.measurementUnit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado: </span>
                    <Badge
                      variant={waterMeter.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {waterMeter.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consumption Calculation */}
        {readings && readings.length >= 2 && waterLimitRule && (
          <ConsumptionCalculation
            waterLimitRule={waterLimitRule}
            pax={waterMeter.waterPoint.fixedPopulation + waterMeter.waterPoint.floatingPopulation}
            lastReading={readings[0] ?? { normalizedReading: 0, readingDate: new Date() }}
            previousReading={readings[1] ?? { normalizedReading: 0, readingDate: new Date() }}
          />
        )}

        {/* Readings History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Historial de Lecturas ({readings?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readingsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Card key={`loading-skeleton-${Date.now()}-${i}`} className="p-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            ) : readingsError ? (
              <div className="text-center text-destructive py-4">
                <p>Error al cargar las lecturas: {readingsError.message}</p>
              </div>
            ) : !readings || readings.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Sin lecturas registradas
                </h3>
                <p className="text-gray-500">
                  Este contador aún no tiene lecturas en su historial.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {readings.map((reading, index) => (
                  <Card
                    key={reading.id}
                    className="p-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-lg">
                              {format(new Date(reading.readingDate), 'dd/MM/yyyy', {
                                locale: es
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            <span className="font-medium">Lectura: </span>
                            <span className="font-mono">{reading.reading}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-blue-600" />
                            <span className="font-semibold text-blue-600">
                              {reading.normalizedReading.toLocaleString('es-ES')} L
                            </span>
                          </div>
                        </div>

                        {reading.notes && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>{reading.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón de editar para las dos primeras lecturas (última y anterior) */}
                      {(index === 0 || index === 1) && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEditReading({
                                id: reading.id,
                                reading: reading.reading,
                                notes: reading.notes ?? null,
                                waterMeterReadingImage: reading.waterMeterReadingImage ?? null
                              })
                            }
                            className="shrink-0"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición */}
      {editingReading && (
        <EditReadingModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingReading(null)
          }}
          reading={editingReading}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de nueva lectura */}
      {addReadingModalOpen && waterMeter && (
        <AddReadingModal
          waterMeterId={waterMeter.id}
          waterPointName={waterMeter.waterPoint.name}
          measurementUnit={waterMeter.measurementUnit}
          lastReadingValue={readings?.[0]?.normalizedReading || null}
          lastReadingDate={readings?.[0]?.readingDate || null}
          onClose={() => setAddReadingModalOpen(false)}
        />
      )}
    </PageContainer>
  )
}
