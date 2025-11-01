import {
  FileSizeExceededError,
  InvalidFileTypeError,
  MAX_FILE_SIZE as MAX_IMAGE_SIZE,
  VALID_IMAGE_TYPES,
  type ValidImageType
} from '@pda/storage'
import { useState } from 'react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/image-compressor'
import type { ImageUploadData } from '@/types/image'

/**
 * Custom hook for handling image upload, validation, compression, and preview
 *
 * @param inputId - Optional ID of the file input element for resetting
 * @returns Object containing image state and handlers
 */
export function useImageUpload(inputId?: string) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  /**
   * Handles image file selection, validation, compression, and preview generation
   */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError(null)

    // Validate file type
    if (!VALID_IMAGE_TYPES.includes(file.type as ValidImageType)) {
      setImageError(InvalidFileTypeError.defaultMessageEs)
      return
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(FileSizeExceededError.defaultMessageEs)
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

  /**
   * Removes the selected image and clears preview
   */
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageError(null)

    // Reset file input if ID provided
    if (inputId) {
      const fileInput = document.getElementById(inputId) as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  /**
   * Converts the selected File to ImageUploadData (Uint8Array format)
   * @returns ImageUploadData or undefined if no image selected
   * @throws Error if conversion fails
   */
  const getImageData = async (): Promise<ImageUploadData | undefined> => {
    if (!selectedImage) return undefined

    try {
      return {
        file: new Uint8Array(await selectedImage.arrayBuffer()),
        metadata: {
          fileSize: selectedImage.size,
          mimeType: selectedImage.type,
          originalName: selectedImage.name
        }
      }
    } catch (error) {
      toast.error('Error al procesar la imagen')
      throw error
    }
  }

  /**
   * Resets all image state (alias for handleRemoveImage)
   */
  const resetImage = () => {
    handleRemoveImage()
  }

  return {
    selectedImage,
    imagePreview,
    imageError,
    handleImageSelect,
    handleRemoveImage,
    getImageData,
    resetImage,
    setImagePreview // Exposed for initializing with existing images
  }
}
