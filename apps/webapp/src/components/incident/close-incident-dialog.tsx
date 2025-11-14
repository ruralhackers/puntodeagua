'use client'

import type { IncidentDto } from '@pda/registers/domain'
import { ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useMultipleImageUpload } from '@/hooks/use-multiple-image-upload'
import { handleDomainError } from '@/lib/error-handler'
import { api } from '@/trpc/react'

interface CloseIncidentDialogProps {
  incident: IncidentDto
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CloseIncidentDialog({
  incident,
  open,
  onOpenChange,
  onSuccess
}: CloseIncidentDialogProps) {
  const [closingDescription, setClosingDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { images, handleImageSelect, removeImage, getImagesData, clearImages } =
    useMultipleImageUpload()

  const updateIncidentMutation = api.incidents.updateIncident.useMutation({
    onSuccess: () => {
      toast.success('Incidencia cerrada con éxito')
      setClosingDescription('')
      clearImages()
      onOpenChange(false)
      onSuccess()
    },
    onError: (error) => {
      handleDomainError(error)
      setIsSubmitting(false)
    }
  })

  const handleSubmit = async () => {
    if (!closingDescription.trim()) {
      toast.error('La descripción de cierre es requerida')
      return
    }

    setIsSubmitting(true)

    // Obtener los datos de las imágenes si hay alguna
    const imagesData = images.length > 0 ? await getImagesData() : undefined

    updateIncidentMutation.mutate({
      ...incident,
      status: 'closed',
      endAt: new Date(),
      closingDescription: closingDescription.trim(),
      newImages: imagesData
    })
  }

  const handleCancel = () => {
    setClosingDescription('')
    clearImages()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cerrar Incidencia</DialogTitle>
          <DialogDescription>
            Antes de cerrar la incidencia, por favor proporciona una descripción del cierre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descripción original (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="original-description">Descripción Original</Label>
            <Textarea
              id="original-description"
              value={incident.description || 'Sin descripción'}
              readOnly
              className="bg-muted/50"
              rows={3}
            />
          </div>

          {/* Descripción de cierre */}
          <div className="space-y-2">
            <Label htmlFor="closing-description">
              Descripción de Cierre <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="closing-description"
              value={closingDescription}
              onChange={(e) => setClosingDescription(e.target.value)}
              placeholder="Describe cómo se resolvió la incidencia..."
              rows={4}
              maxLength={2000}
            />
            <div className="text-sm text-muted-foreground">
              {closingDescription.length}/2000 caracteres
            </div>
          </div>

          {/* Imágenes de resolución */}
          <div className="space-y-2">
            <Label>Imágenes de Resolución (Opcional)</Label>
            <p className="text-sm text-muted-foreground">
              Puedes adjuntar fotos que muestren cómo se resolvió la incidencia
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full"
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Agregar Imágenes
            </Button>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={image.preview}
                        alt={image.file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !closingDescription.trim()}
          >
            {isSubmitting ? 'Cerrando...' : 'Cerrar Incidencia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
