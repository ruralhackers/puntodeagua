'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface IncidentImageData {
  id: string
  url: string
  fileName: string
  fileSize: number
  uploadedAt: Date
}

interface IncidentImageGalleryProps {
  images: IncidentImageData[]
  onDeleteImage?: (imageId: string) => void
  canDelete?: boolean
}

export function IncidentImageGallery({
  images,
  onDeleteImage,
  canDelete = false
}: IncidentImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<IncidentImageData | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay imágenes adjuntas</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <Image src={image.url} alt={image.fileName} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(image)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{image.fileName}</p>
          </div>
        ))}
      </div>

      {/* Full size image dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Imagen del incidente</DialogTitle>
            {selectedImage && (
              <p className="text-sm text-muted-foreground">
                {selectedImage.fileName} • {(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                {format(new Date(selectedImage.uploadedAt), "dd/MM/yyyy 'a las' HH:mm", {
                  locale: es
                })}
              </p>
            )}
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full h-[70vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.fileName}
                fill
                className="object-contain"
              />
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {canDelete && onDeleteImage && selectedImage && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Imagen
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedImage && onDeleteImage) {
                  onDeleteImage(selectedImage.id)
                  setSelectedImage(null)
                  setShowDeleteConfirm(false)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
