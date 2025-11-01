'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { WaterMeterReadingImageDto } from '@pda/water-account'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useSpanishNumberParser } from '@/hooks/use-spanish-number-parser'
import { api } from '@/trpc/react'
import { ACCEPTED_FILE_TYPES } from '@/types/image'

const editReadingSchema = z.object({
  reading: z.string().min(1, 'La lectura es requerida'),
  notes: z.string().nullable().optional()
})

type EditReadingFormData = z.infer<typeof editReadingSchema>

interface EditReadingModalProps {
  isOpen: boolean
  onClose: () => void
  reading: {
    id: string
    reading: string
    notes: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  }
  onSuccess?: () => void
}

export function EditReadingModal({ isOpen, onClose, reading, onSuccess }: EditReadingModalProps) {
  const { parseSpanishNumber, formatToSpanish } = useSpanishNumberParser()

  // Image state management
  const {
    imagePreview,
    imageError,
    handleImageSelect,
    handleRemoveImage,
    getImageData,
    setImagePreview
  } = useImageUpload('edit-image')
  const [shouldDeleteExistingImage, setShouldDeleteExistingImage] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  const form = useForm<EditReadingFormData>({
    resolver: zodResolver(editReadingSchema),
    defaultValues: {
      reading: formatToSpanish(parseFloat(reading.reading)),
      notes: reading.notes || ''
    }
  })

  // Initialize existing image
  useEffect(() => {
    if (reading.waterMeterReadingImage?.url) {
      setIsLoadingImage(true)
      setImagePreview(reading.waterMeterReadingImage.url)
      setShouldDeleteExistingImage(false)
      // Simulate image load for better UX
      const img = new Image()
      img.onload = () => setIsLoadingImage(false)
      img.onerror = () => setIsLoadingImage(false)
      img.src = reading.waterMeterReadingImage.url
    } else {
      setImagePreview(null)
      setShouldDeleteExistingImage(false)
      setIsLoadingImage(false)
    }
  }, [reading.waterMeterReadingImage, setImagePreview])

  const updateReadingMutation = api.waterAccount.updateWaterMeterReading.useMutation({
    onSuccess: (data) => {
      // Show appropriate toast based on result
      if (data?.imageUploadFailed) {
        toast.warning('Lectura actualizada, pero no se pudo subir la nueva imagen')
      } else if (data?.imageDeleteFailed) {
        toast.warning('Lectura actualizada, pero no se pudo eliminar la imagen anterior')
      } else {
        toast.success('Lectura actualizada correctamente')
      }
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error('Error al actualizar la lectura: ' + error.message)
    }
  })

  // Custom remove handler that sets shouldDeleteExistingImage flag
  // This flag indicates the user wants to delete the existing image
  const handleRemoveImageWithFlag = () => {
    handleRemoveImage()
    setShouldDeleteExistingImage(true)
  }

  const onSubmit = async (data: EditReadingFormData) => {
    // Prepare image data if new image is selected
    const imageData = await getImageData()

    updateReadingMutation.mutate({
      id: reading.id,
      reading: parseSpanishNumber(data.reading).toString(),
      notes: data.notes || null,
      // Type assertion needed due to ArrayBuffer vs ArrayBufferLike difference
      image: imageData as Parameters<typeof updateReadingMutation.mutate>[0]['image'],
      deleteImage: shouldDeleteExistingImage && !imageData // Only delete if no new image
    })
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Lectura</DialogTitle>
          <DialogDescription>
            Modifica la lectura del contador. Se pueden editar las dos últimas lecturas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lectura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa la nueva lectura"
                      {...field}
                      disabled={updateReadingMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agrega notas sobre esta lectura..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                      disabled={updateReadingMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image upload section */}
            <div className="space-y-2">
              <Label htmlFor="edit-image">Foto (opcional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleImageSelect}
                disabled={updateReadingMutation.isPending}
              />
              {imageError && <p className="text-sm text-red-500">{imageError}</p>}
              {isLoadingImage && (
                <div className="mt-2 space-y-2">
                  <div className="h-40 rounded border bg-muted animate-pulse" />
                  <p className="text-sm text-muted-foreground">Cargando imagen...</p>
                </div>
              )}
              {imagePreview && !isLoadingImage && (
                <div className="mt-2 space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="max-h-40 rounded border object-contain"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImageWithFlag}
                    disabled={updateReadingMutation.isPending}
                  >
                    Quitar foto
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateReadingMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateReadingMutation.isPending}>
                {updateReadingMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Actualizar Lectura
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
