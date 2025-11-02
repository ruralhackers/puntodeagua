'use client'

import type { WaterMeterReadingImageDto } from '@pda/water-account'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import type { ImagePreviewData } from '@/types/image'
import { ConsumptionCalculation } from '../_components/consumption-calculation'
import { AddReadingModal } from '../new/_components/add-reading-modal'
import { EditReadingModal } from './_components/edit-reading-modal'
import { MeterInfoCard } from './_components/meter-info-card'
import { ReadingsHistoryCard } from './_components/readings-history-card'
import { WaterMeterDetailSkeleton } from './_components/water-meter-detail-skeleton'
import { WaterMeterHeader } from './_components/water-meter-header'
import { WaterMeterImageModal } from './_components/water-meter-image-modal'

export default function WaterMeterDetailPage() {
  const params = useParams()
  const waterMeterId = params.id as string
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addReadingModalOpen, setAddReadingModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [editImageModalOpen, setEditImageModalOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<{
    id: string
    reading: string
    notes: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  } | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImagePreviewData | null>(null)

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
    utils.waterAccount.getWaterMeterReadings.invalidate({ waterMeterId })
    utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })
  }

  const handleViewImage = (image: WaterMeterReadingImageDto) => {
    setSelectedImage({
      url: image.url,
      fileName: image.fileName,
      fileSize: image.fileSize,
      uploadedAt: image.uploadedAt
    })
    setImageModalOpen(true)
  }

  const handleMeterImageView = () => {
    if (waterMeter?.waterMeterImage) {
      setSelectedImage({
        url: waterMeter.waterMeterImage.url,
        fileName: waterMeter.waterMeterImage.fileName,
        fileSize: waterMeter.waterMeterImage.fileSize,
        uploadedAt: waterMeter.waterMeterImage.uploadedAt
      })
      setImageModalOpen(true)
    }
  }

  const handleRecalculateExcess = () => {
    recalculateExcessMutation.mutate({ waterMeterId })
  }

  if (meterLoading) {
    return (
      <PageContainer>
        <WaterMeterDetailSkeleton />
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

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        {/* Header */}
        <WaterMeterHeader
          waterAccountName={waterMeter.waterAccountName}
          waterPointName={waterMeter.waterPoint.name}
          lastReadingDate={waterMeter.lastReadingDate}
          lastReadingExcessConsumption={waterMeter.lastReadingExcessConsumption}
          onAddReading={() => setAddReadingModalOpen(true)}
        />

        {/* Water Meter Info Card */}
        <MeterInfoCard
          lastReadingDate={waterMeter.lastReadingDate}
          lastReadingNormalizedValue={waterMeter.lastReadingNormalizedValue}
          lastReadingExcessConsumption={waterMeter.lastReadingExcessConsumption}
          waterPoint={waterMeter.waterPoint}
          measurementUnit={waterMeter.measurementUnit}
          isActive={waterMeter.isActive}
          waterMeterImage={waterMeter.waterMeterImage}
          onRecalculate={handleRecalculateExcess}
          isRecalculating={recalculateExcessMutation.isPending}
          onViewImage={handleMeterImageView}
          onEditImage={() => setEditImageModalOpen(true)}
        />

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
        <ReadingsHistoryCard
          readings={readings}
          isLoading={readingsLoading}
          error={readingsError}
          onViewImage={handleViewImage}
          onEdit={handleEditReading}
        />
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

      {/* Modal de visualización de imagen */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Foto de la lectura</DialogTitle>
            {selectedImage && (
              <DialogDescription>
                {selectedImage.fileName} • {(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                {format(new Date(selectedImage.uploadedAt), "dd/MM/yyyy 'a las' HH:mm", {
                  locale: es
                })}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center items-center relative w-full h-[70vh]">
              <Image
                src={selectedImage.url}
                alt="Foto de la lectura"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar imagen del contador */}
      {editImageModalOpen && waterMeter && (
        <WaterMeterImageModal
          waterMeterId={waterMeter.id}
          currentImage={waterMeter.waterMeterImage || null}
          onClose={() => setEditImageModalOpen(false)}
          onSuccess={() => {
            utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })
            setEditImageModalOpen(false)
          }}
        />
      )}
    </PageContainer>
  )
}
