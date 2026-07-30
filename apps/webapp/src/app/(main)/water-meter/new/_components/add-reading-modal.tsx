'use client'

import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSpanishNumberParser } from '@/hooks/use-spanish-number-parser'
import { handleDomainError } from '@/lib/error-handler'
import { type ReadingValidationError, validateReading } from '@/lib/reading-validation'
import { api } from '@/trpc/react'
import { ACCEPTED_FILE_TYPES } from '@/types/image'

interface AddReadingModalProps {
  waterMeterId: string
  waterPointName: string
  measurementUnit: string
  lastReadingValue: number | null
  lastReadingDate: Date | null
  onClose: () => void
}

function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

function getCurrentTimeString(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getDefaultReadingForm() {
  return {
    reading: '',
    readingDate: getCurrentDateString(),
    readingTime: getCurrentTimeString(),
    notes: ''
  }
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}

export function AddReadingModal({
  waterMeterId,
  waterPointName,
  measurementUnit,
  lastReadingValue,
  lastReadingDate,
  onClose
}: AddReadingModalProps) {
  const [readingForm, setReadingForm] = useState(getDefaultReadingForm)
  const [validationError, setValidationError] = useState<ReadingValidationError | null>(null)

  const utils = api.useUtils()
  const { parseSpanishNumber } = useSpanishNumberParser()
  const { imagePreview, imageError, handleImageSelect, handleRemoveImage, getImageData } =
    useImageUpload('image')
  const isMobile = useIsMobile()

  // Helper function to normalize reading based on measurement unit
  const normalizeReading = (reading: string): number => {
    const value = parseSpanishNumber(reading)
    // If measurement unit is m³, convert to liters (1 m³ = 1000 L)
    const normalizedValue = measurementUnit.toLowerCase() === 'm3' ? value * 1000 : value
    return normalizedValue
  }

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Mutation for adding new reading
  const addReadingMutation = api.waterAccount.addWaterMeterReading.useMutation({
    onSuccess: async (data) => {
      // Invalidate and refetch water meters data
      await utils.waterAccount.getActiveWaterMetersOrderedByLastReading.invalidate()
      // Invalidate water meter readings to update the history
      await utils.waterAccount.getWaterMeterReadings.invalidate({ waterMeterId })
      // Invalidate water meter details to update last reading and excess consumption
      await utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })

      // Reset form and image state
      setReadingForm(getDefaultReadingForm())
      handleRemoveImage()

      onClose()

      // Show appropriate toast based on image upload result
      if (data?.imageUploadFailed) {
        toast.warning(
          'Lectura guardada, pero no se pudo subir la imagen. Puedes editarla más tarde.'
        )
      } else {
        toast.success('Lectura añadida con éxito')
      }
    },
    onError: (error) => {
      handleDomainError(error)
    }
  })

  const handleSubmitReading = async () => {
    if (!readingForm.reading || !readingForm.readingDate || !readingForm.readingTime) return

    const readingDate = combineDateAndTime(readingForm.readingDate, readingForm.readingTime)

    const error = validateReading({
      normalizedReading: normalizeReading(readingForm.reading),
      readingDate,
      lastReadingValue,
      lastReadingDate,
      now: new Date()
    })

    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)

    // Prepare image data if image is selected
    const imageData = await getImageData()

    // Convert Spanish format to standard format before sending to backend
    const standardReading = parseSpanishNumber(readingForm.reading).toString()
    addReadingMutation.mutate({
      waterMeterId: waterMeterId,
      reading: standardReading,
      readingDate,
      notes: readingForm.notes || null,
      // Type assertion needed due to ArrayBuffer vs ArrayBufferLike difference
      image: imageData as Parameters<typeof addReadingMutation.mutate>[0]['image']
    })
  }

  const updateField = (field: 'readingDate' | 'readingTime' | 'notes', value: string) => {
    setReadingForm((prev) => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  const handleReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow only: digits, comma (one only), dots, and empty string
    const validPattern = /^[0-9]*[.,]?[0-9]*$/

    if (validPattern.test(value) || value === '') {
      setReadingForm((prev) => ({ ...prev, reading: value }))
      setValidationError(null)
    }
  }

  const handleClose = () => {
    onClose()
    setValidationError(null)
    // Reset form when closing
    setReadingForm(getDefaultReadingForm())
    handleRemoveImage()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className={isMobile ? '' : 'sm:max-w-[425px]'} fullscreenOnMobile>
        {isMobile ? (
          // Mobile fullscreen layout
          <>
            <DialogTitle className="sr-only">Nueva Lectura</DialogTitle>
            {/* Sticky header with save and close buttons */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2">
              <Button
                type="button"
                onClick={handleSubmitReading}
                disabled={!readingForm.reading || addReadingMutation.isPending}
                size="sm"
              >
                {addReadingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={addReadingMutation.isPending}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Nueva Lectura</h2>
                <p className="text-sm text-muted-foreground">
                  Añadir una nueva lectura para: <strong>{waterPointName}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Unidad de medida:{' '}
                  <strong>{measurementUnit === 'L' ? 'Litros (L)' : 'Metros cúbicos (m³)'}</strong>
                </p>
                {lastReadingValue !== null && (
                  <p className="text-sm text-muted-foreground">
                    Última lectura:{' '}
                    <strong>
                      {measurementUnit === 'L'
                        ? `${lastReadingValue.toLocaleString('es-ES')} L`
                        : `${(lastReadingValue / 1000).toLocaleString('es-ES')} m³`}
                    </strong>
                    {lastReadingDate && ` (${formatDate(lastReadingDate)})`}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reading">Lectura</Label>
                  <Input
                    id="reading"
                    type="text"
                    inputMode="decimal"
                    placeholder={`0,00 ${measurementUnit}`}
                    className={validationError?.field === 'reading' ? 'border-red-500' : ''}
                    value={readingForm.reading}
                    onChange={handleReadingChange}
                  />
                  {validationError?.field === 'reading' && (
                    <p className="text-sm text-red-500 mt-1">{validationError.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="readingDate">Fecha</Label>
                    <Input
                      id="readingDate"
                      type="date"
                      value={readingForm.readingDate}
                      max={getCurrentDateString()}
                      onChange={(e) => updateField('readingDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="readingTime">Hora</Label>
                    <Input
                      id="readingTime"
                      type="time"
                      value={readingForm.readingTime}
                      onChange={(e) => updateField('readingTime', e.target.value)}
                    />
                  </div>
                </div>
                {validationError?.field === 'date' && (
                  <p className="text-sm text-red-500 -mt-2">{validationError.message}</p>
                )}

                <div>
                  <Label htmlFor="image">Foto</Label>
                  <Input
                    id="image"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    capture="environment"
                    onChange={handleImageSelect}
                    disabled={addReadingMutation.isPending}
                  />
                  {imageError && <p className="text-sm text-red-500 mt-1">{imageError}</p>}
                  {imagePreview && (
                    <div className="mt-2 space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="max-h-40 rounded border"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveImage}
                        disabled={addReadingMutation.isPending}
                      >
                        Quitar foto
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notas opcionales..."
                    rows={3}
                    value={readingForm.notes}
                    onChange={(e) => setReadingForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          // Desktop modal layout
          <>
            <DialogHeader>
              <DialogTitle>Nueva Lectura</DialogTitle>
              <DialogDescription>
                Añadir una nueva lectura para: <strong>{waterPointName}</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  Unidad de medida:{' '}
                  <strong>{measurementUnit === 'L' ? 'Litros (L)' : 'Metros cúbicos (m³)'}</strong>
                </span>
                {lastReadingValue !== null && (
                  <>
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Última lectura:{' '}
                      <strong>
                        {measurementUnit === 'L'
                          ? `${lastReadingValue.toLocaleString('es-ES')} L`
                          : `${(lastReadingValue / 1000).toLocaleString('es-ES')} m³`}
                      </strong>
                      {lastReadingDate && ` (${formatDate(lastReadingDate)})`}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reading" className="text-right">
                  Lectura
                </Label>
                <div className="col-span-3">
                  <Input
                    id="reading"
                    type="text"
                    inputMode="decimal"
                    placeholder={`0,00 ${measurementUnit}`}
                    className={validationError?.field === 'reading' ? 'border-red-500' : ''}
                    value={readingForm.reading}
                    onChange={handleReadingChange}
                  />
                  {validationError?.field === 'reading' && (
                    <p className="text-sm text-red-500 mt-1">{validationError.message}</p>
                  )}
                </div>
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
                  max={getCurrentDateString()}
                  onChange={(e) => updateField('readingDate', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="readingTime" className="text-right">
                  Hora
                </Label>
                <Input
                  id="readingTime"
                  type="time"
                  className="col-span-3"
                  value={readingForm.readingTime}
                  onChange={(e) => updateField('readingTime', e.target.value)}
                />
              </div>
              {validationError?.field === 'date' && (
                <p className="col-span-4 text-right text-sm text-red-500">
                  {validationError.message}
                </p>
              )}

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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Foto
                </Label>
                <div className="col-span-3">
                  <Input
                    id="image"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    capture="environment"
                    onChange={handleImageSelect}
                    disabled={addReadingMutation.isPending}
                  />
                  {imageError && <p className="text-sm text-red-500 mt-1">{imageError}</p>}
                  {imagePreview && (
                    <div className="mt-2 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="max-h-40 rounded border"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        onClick={handleRemoveImage}
                        disabled={addReadingMutation.isPending}
                      >
                        Quitar foto
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={addReadingMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmitReading}
                disabled={!readingForm.reading || addReadingMutation.isPending}
              >
                {addReadingMutation.isPending
                  ? imagePreview
                    ? 'Guardando lectura y subiendo imagen...'
                    : 'Guardando lectura...'
                  : 'Guardar Lectura'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
