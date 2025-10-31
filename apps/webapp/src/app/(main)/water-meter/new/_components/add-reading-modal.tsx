'use client'

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
import { useSpanishNumberParser } from '@/hooks/use-spanish-number-parser'
import { handleDomainError } from '@/lib/error-handler'
import { compressImage } from '@/lib/image-compressor'
import { api } from '@/trpc/react'

interface AddReadingModalProps {
  waterMeterId: string
  waterPointName: string
  measurementUnit: string
  lastReadingValue: number | null
  lastReadingDate: Date | null
  onClose: () => void
}

export function AddReadingModal({
  waterMeterId,
  waterPointName,
  measurementUnit,
  lastReadingValue,
  lastReadingDate,
  onClose
}: AddReadingModalProps) {
  const [readingForm, setReadingForm] = useState({
    reading: '',
    readingDate: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const utils = api.useUtils()
  const { parseSpanishNumber } = useSpanishNumberParser()

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
    onSuccess: async () => {
      // Invalidate and refetch water meters data
      await utils.waterAccount.getActiveWaterMetersOrderedByLastReading.invalidate()
      // Invalidate water meter readings to update the history
      await utils.waterAccount.getWaterMeterReadings.invalidate({ waterMeterId })
      // Invalidate water meter details to update last reading and excess consumption
      await utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })

      // Reset form and image state
      setReadingForm({
        reading: '',
        readingDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
      handleRemoveImage()

      onClose()
      toast.success('Lectura añadida con éxito')
    },
    onError: (error) => {
      handleDomainError(error)
    }
  })

  const handleSubmitReading = async () => {
    if (!readingForm.reading || !readingForm.readingDate) return

    // Client-side validation: check if new reading is less than last reading
    if (lastReadingValue !== null) {
      const newNormalizedReading = normalizeReading(readingForm.reading)
      if (newNormalizedReading < lastReadingValue) {
        setValidationError('La nueva lectura no puede ser menor que la última lectura')
        return
      }
    }

    setValidationError(null)

    // Prepare image data if image is selected
    let imageData:
      | {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          file: any
          metadata: {
            fileSize: number
            mimeType: string
            originalName: string
          }
        }
      | undefined
    if (selectedImage) {
      try {
        imageData = {
          file: new Uint8Array(await selectedImage.arrayBuffer()),
          metadata: {
            fileSize: selectedImage.size,
            mimeType: selectedImage.type,
            originalName: selectedImage.name
          }
        }
      } catch {
        toast.error('Error al procesar la imagen')
        return
      }
    }

    // Convert Spanish format to standard format before sending to backend
    const standardReading = parseSpanishNumber(readingForm.reading).toString()
    addReadingMutation.mutate({
      waterMeterId: waterMeterId,
      reading: standardReading,
      readingDate: new Date(readingForm.readingDate),
      notes: readingForm.notes || null,
      image: imageData
    })
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error
    setImageError(null)

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setImageError('Formato no válido. Solo se permiten archivos JPG, PNG o WebP.')
      return
    }

    // Validate file size (10MB max before compression)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setImageError('La imagen es demasiado grande. Máximo 10MB.')
      return
    }

    try {
      // Compress the image
      const compressedFile = await compressImage(file)

      setSelectedImage(compressedFile)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error processing image:', error)
      setImageError('Error al procesar la imagen. Intenta con otra.')
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageError(null)
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleClose = () => {
    onClose()
    setValidationError(null)
    // Reset form when closing
    setReadingForm({
      reading: '',
      readingDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
    handleRemoveImage()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
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
                className={validationError ? 'border-red-500' : ''}
                value={readingForm.reading}
                onChange={handleReadingChange}
              />
              {validationError && <p className="text-sm text-red-500 mt-1">{validationError}</p>}
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
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setReadingForm((prev) => ({ ...prev, readingDate: e.target.value }))}
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Foto
            </Label>
            <div className="col-span-3">
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={addReadingMutation.isPending}
              />
              {imageError && <p className="text-sm text-red-500 mt-1">{imageError}</p>}
              {imagePreview && (
                <div className="mt-2 relative">
                  <img src={imagePreview} alt="Vista previa" className="max-h-40 rounded border" />
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
            disabled={!readingForm.reading || addReadingMutation.isPending || !!validationError}
          >
            {addReadingMutation.isPending ? 'Guardando...' : 'Guardar Lectura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
