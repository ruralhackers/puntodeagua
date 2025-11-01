'use client'

import type { WaterMeterImageDto } from '@pda/water-account'
import { Loader2, Trash2, Upload, X } from 'lucide-react'
import NextImage from 'next/image'
import { useEffect, useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { useImageUpload } from '@/hooks/use-image-upload'
import { api } from '@/trpc/react'
import { ACCEPTED_FILE_TYPES } from '@/types/image'

interface WaterMeterImageModalProps {
  waterMeterId: string
  currentImage: WaterMeterImageDto | null
  onClose: () => void
  onSuccess: () => void
}

export function WaterMeterImageModal({
  waterMeterId,
  currentImage,
  onClose,
  onSuccess
}: WaterMeterImageModalProps) {
  const {
    imagePreview,
    imageError,
    handleImageSelect,
    handleRemoveImage,
    getImageData,
    setImagePreview
  } = useImageUpload('water-meter-image')
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  // Initialize existing image
  useEffect(() => {
    if (currentImage?.url) {
      setIsLoadingImage(true)
      setImagePreview(currentImage.url)
      const img = new window.Image()
      img.onload = () => setIsLoadingImage(false)
      img.onerror = () => setIsLoadingImage(false)
      img.src = currentImage.url
    } else {
      setImagePreview(null)
      setIsLoadingImage(false)
    }
  }, [currentImage, setImagePreview])

  const updateImageMutation = api.waterAccount.updateWaterMeterImage.useMutation({
    onSuccess: () => {
      toast.success('Imagen actualizada correctamente')
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error('Error al actualizar la imagen', {
        description: error.message
      })
    }
  })

  const handleSubmit = async () => {
    const imageData = await getImageData()

    if (!imageData && !currentImage) {
      toast.error('Por favor selecciona una imagen')
      return
    }

    updateImageMutation.mutate({
      waterMeterId,
      image: imageData || undefined,
      deleteImage: !imageData && currentImage ? true : false
    })
  }

  const handleDelete = () => {
    updateImageMutation.mutate({
      waterMeterId,
      deleteImage: true
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentImage ? 'Cambiar imagen del contador' : 'Agregar imagen del contador'}
          </DialogTitle>
          <DialogDescription>
            Sube una foto del contador para identificarlo fácilmente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Imagen</Label>
            <div className="flex flex-col gap-2">
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  {isLoadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <NextImage src={imagePreview} alt="Preview" fill className="object-cover" />
                    </>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Subir imagen</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
              {imageError && <p className="text-sm text-red-500">{imageError}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentImage && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={updateImageMutation.isPending}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar imagen
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateImageMutation.isPending || (!imagePreview && !currentImage)}
          >
            {updateImageMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
