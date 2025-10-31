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
import { useSpanishNumberParser } from '@/hooks/use-spanish-number-parser'
import { compressImage } from '@/lib/image-compressor'
import { api } from '@/trpc/react'

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [deleteExistingImage, setDeleteExistingImage] = useState(false)

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
      setImagePreview(reading.waterMeterReadingImage.url)
      setSelectedImage(null)
      setDeleteExistingImage(false)
    } else {
      setImagePreview(null)
      setSelectedImage(null)
      setDeleteExistingImage(false)
    }
  }, [reading.waterMeterReadingImage])

  const updateReadingMutation = api.waterAccount.updateWaterMeterReading.useMutation({
    onSuccess: () => {
      toast.success('Lectura actualizada correctamente')
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error('Error al actualizar la lectura: ' + error.message)
    }
  })

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      setDeleteExistingImage(false) // If adding new image, don't delete flag

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
    setDeleteExistingImage(true) // Mark for deletion

    // Reset file input
    const fileInput = document.getElementById('edit-image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const onSubmit = async (data: EditReadingFormData) => {
    // Prepare image data if new image is selected
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

    updateReadingMutation.mutate({
      id: reading.id,
      reading: parseSpanishNumber(data.reading).toString(),
      notes: data.notes || null,
      image: imageData,
      deleteImage: deleteExistingImage && !selectedImage // Only delete if no new image
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
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={updateReadingMutation.isPending}
              />
              {imageError && <p className="text-sm text-red-500">{imageError}</p>}
              {imagePreview && (
                <div className="mt-2 space-y-2">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="max-h-40 rounded border object-contain"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImage}
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
