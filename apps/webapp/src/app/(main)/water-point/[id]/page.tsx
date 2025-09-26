'use client'

import type { WaterMeterDto } from '@pda/water-account/domain'
import { ArrowLeft, FileText, Gauge, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/trpc/react'

export default function WaterPointDetailPage() {
  const params = useParams()
  const waterPointId = params.id as string

  // Modal state
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState<WaterMeterDto | null>(null)
  const [readingForm, setReadingForm] = useState({
    reading: '',
    readingDate: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  })

  const utils = api.useUtils()

  const {
    data: waterPoint,
    isLoading,
    error
  } = api.community.getWaterPointById.useQuery({ id: waterPointId }, { enabled: !!waterPointId })

  const {
    data: waterMeters,
    isLoading: isLoadingMeters,
    error: metersError
  } = api.waterAccount.getWaterMetersByWaterPointId.useQuery(
    { id: waterPointId },
    { enabled: !!waterPointId }
  )

  // Mutation for adding new reading
  const addReadingMutation = api.waterAccount.addWaterMeterReading.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch water meters data
      await utils.waterAccount.getWaterMetersByWaterPointId.invalidate({ id: waterPointId })
      setIsReadingModalOpen(false)
      setSelectedMeter(null)
      setReadingForm({
        reading: '',
        readingDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
    }
  })

  const handleOpenReadingModal = (meter: WaterMeterDto) => {
    setSelectedMeter(meter)
    setIsReadingModalOpen(true)
  }

  const handleSubmitReading = async () => {
    if (!selectedMeter || !readingForm.reading || !readingForm.readingDate) return

    try {
      await addReadingMutation.mutateAsync({
        waterMeterId: selectedMeter.id,
        reading: readingForm.reading,
        readingDate: new Date(readingForm.readingDate),
        notes: readingForm.notes || null
      })
    } catch (error) {
      console.error('Error adding reading:', error)
    }
  }

  if (isLoading) {
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

  if (error) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/water-point">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <h2 className="text-lg font-semibold mb-2">Error al cargar el punto de agua</h2>
                <p>{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  if (!waterPoint) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/water-point">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <h2 className="text-lg font-semibold mb-2">Punto de agua no encontrado</h2>
                <p>El punto de agua solicitado no existe o no tienes permisos para verlo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/water-point">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{waterPoint.name}</h1>
            <p className="text-muted-foreground">Detalle del punto de agua</p>
          </div>
        </div>

        {/* Water Point Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">{waterPoint.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{waterPoint.location}</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                {waterPoint.cadastralReference}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Population Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información de Población</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">Población Fija</p>
                    <p className="text-2xl font-bold text-blue-600">{waterPoint.fixedPopulation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">Población Flotante</p>
                    <p className="text-2xl font-bold text-green-600">
                      {waterPoint.floatingPopulation}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">Población Total</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {waterPoint.fixedPopulation + waterPoint.floatingPopulation}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {waterPoint.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Notas</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{waterPoint.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Additional Information */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Información Técnica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">ID del Punto de Agua</p>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{waterPoint.id}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Referencia Catastral</p>
                  <p className="font-mono">{waterPoint.cadastralReference}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Zona de Comunidad</p>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {waterPoint.communityZoneId}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Coordenadas</p>
                  <p className="font-mono">{waterPoint.location}</p>
                </div>
              </div>
            </div>

            {/* Water Meters Section */}
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Contadores de Agua</h3>
              </div>

              {isLoadingMeters ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }, (_, i) => (
                    <Card key={`meter-skeleton-${Date.now()}-${i}`} className="animate-pulse">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : metersError ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                      Error al cargar los contadores: {metersError.message}
                    </div>
                  </CardContent>
                </Card>
              ) : !waterMeters || waterMeters.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Gauge className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay contadores registrados para este punto de agua</p>
                      <p className="text-sm mt-1">Añade el primer contador para comenzar</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {waterMeters.map((meter) => (
                    <Card key={meter.id} className="hover:shadow-sm transition-shadow">
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-blue-500" />
                              <h4 className="font-semibold">{meter.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {meter.measurementUnit}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-muted-foreground">Última Lectura</p>
                                <p className="font-mono">
                                  {meter.lastReadingNormalizedValue !== null
                                    ? `${meter.lastReadingNormalizedValue} ${meter.measurementUnit}`
                                    : 'Sin lecturas'}
                                </p>
                              </div>

                              <div>
                                <p className="font-medium text-muted-foreground">Fecha</p>
                                <p>
                                  {meter.lastReadingDate
                                    ? new Date(meter.lastReadingDate).toLocaleDateString('es-ES')
                                    : 'N/A'}
                                </p>
                              </div>

                              <div>
                                <p className="font-medium text-muted-foreground">Estado</p>
                                <div className="flex items-center gap-1">
                                  {meter.lastReadingExcessConsumption === true && (
                                    <Badge variant="destructive" className="text-xs">
                                      Consumo Excesivo
                                    </Badge>
                                  )}
                                  {meter.lastReadingExcessConsumption === false && (
                                    <Badge variant="secondary" className="text-xs">
                                      Normal
                                    </Badge>
                                  )}
                                  {meter.lastReadingExcessConsumption === null && (
                                    <Badge variant="outline" className="text-xs">
                                      Sin datos
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReadingModal(meter)}
                          >
                            Nueva Lectura
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reading Modal */}
        <Dialog open={isReadingModalOpen} onOpenChange={setIsReadingModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nueva Lectura</DialogTitle>
              <DialogDescription>
                Añadir una nueva lectura para el contador: {selectedMeter?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reading" className="text-right">
                  Lectura
                </Label>
                <Input
                  id="reading"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="col-span-3"
                  value={readingForm.reading}
                  onChange={(e) => setReadingForm((prev) => ({ ...prev, reading: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="readingDate" className="text-right">
                  Fecha
                </Label>
                <Input
                  id="readingDate"
                  type="date"
                  className="col-span-3"
                  value={readingForm.readingDate}
                  onChange={(e) =>
                    setReadingForm((prev) => ({ ...prev, readingDate: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Notas opcionales..."
                  className="col-span-3"
                  rows={3}
                  value={readingForm.notes}
                  onChange={(e) => setReadingForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReadingModalOpen(false)}
                disabled={addReadingMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmitReading}
                disabled={!readingForm.reading || addReadingMutation.isPending}
              >
                {addReadingMutation.isPending ? 'Guardando...' : 'Guardar Lectura'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  )
}
