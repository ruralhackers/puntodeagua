import {
  FileSizeExceededError,
  InvalidFileTypeError,
  MAX_FILE_SIZE as MAX_IMAGE_SIZE,
  VALID_IMAGE_TYPES,
  type ValidImageType
} from '@pda/storage'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/image-compressor'

interface ImageFile {
  id: string
  file: File
  preview: string
}

/**
 * Custom hook for handling multiple image uploads with validation, compression, and previews
 *
 * @returns Object containing images state and handlers
 */
export function useMultipleImageUpload() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError(null)
    const newImages: ImageFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!VALID_IMAGE_TYPES.includes(file.type as ValidImageType)) {
        toast.error(`Archivo no válido: ${file.name}. ${InvalidFileTypeError.defaultMessageEs}`)
        continue
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`Imagen muy grande: ${file.name}. ${FileSizeExceededError.defaultMessageEs}`)
        continue
      }

      try {
        // Compress image
        const compressedFile = await compressImage(file)

        // Create preview
        const preview = URL.createObjectURL(compressedFile)

        newImages.push({
          id: `${Date.now()}-${i}`,
          file: compressedFile,
          preview
        })
      } catch (error) {
        console.error('Error processing image:', error)
        toast.error(`Error procesando imagen: ${file.name}`)
      }
    }

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const clearImages = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview)
    })
    setImages([])
    setError(null)
  }, [images])

  const getImagesData = useCallback(async () => {
    const imagesData = await Promise.all(
      images.map(async (img) => {
        const arrayBuffer = await img.file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        return {
          file: uint8Array,
          metadata: {
            originalName: img.file.name,
            fileSize: img.file.size,
            mimeType: img.file.type
          }
        }
      })
    )

    return imagesData
  }, [images])

  return {
    images,
    error,
    handleImageSelect,
    removeImage,
    clearImages,
    getImagesData
  }
}
