'use client'

import type { WaterMeterDto } from '@pda/water-account/domain'
import { ArrowLeft, FileText, Gauge, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/trpc/react'
import AddReadingModal from '../_components/add-reading-modal'
import PopulationInfoSection from '../_components/population-info-section'
import WaterMeterCard from '../_components/water-meter-card'

export default function WaterPointDetailPage() {
  const params = useParams()
  const waterPointId = params.id as string

  // Modal state - simplified
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState<WaterMeterDto | null>(null)

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

  const handleOpenReadingModal = (meter: WaterMeterDto) => {
    setSelectedMeter(meter)
    setIsReadingModalOpen(true)
  }

  const handleCloseReadingModal = () => {
    setIsReadingModalOpen(false)
    setSelectedMeter(null)
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
            <PopulationInfoSection waterPoint={waterPoint} />

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
                    <WaterMeterCard
                      key={meter.id}
                      meter={meter}
                      onAddReading={handleOpenReadingModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reading Modal */}
        <AddReadingModal
          isOpen={isReadingModalOpen}
          onClose={handleCloseReadingModal}
          selectedMeter={selectedMeter}
          waterPointId={waterPointId}
        />
      </div>
    </PageContainer>
  )
}
