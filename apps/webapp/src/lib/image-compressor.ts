import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 800, // Optimized for water meter readings
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8
}

/**
 * Compresses an image file to reduce size while maintaining quality
 * @param file - The image file to compress
 * @returns The compressed file
 */
export async function compressImage(file: File): Promise<File> {
  // Skip compression for files already under 200KB
  if (file.size < 200 * 1024) {
    return file
  }

  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS)
    
    // If compression didn't help much, return original
    if (compressedFile.size > file.size * 0.9) {
      return file
    }

    console.log(
      `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    )

    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    return file
  }
}

