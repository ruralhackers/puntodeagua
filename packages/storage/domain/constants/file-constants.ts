// Image types
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

// Document types (for future use)
export const VALID_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

// All valid types
export const VALID_FILE_TYPES = [...VALID_IMAGE_TYPES, ...VALID_DOCUMENT_TYPES] as const

// Size limits
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024 // 50MB

// Legacy export for backward compatibility
export const MAX_FILE_SIZE = MAX_IMAGE_SIZE

export const DEFAULT_FILE_EXTENSION = 'jpg'

// Type exports
export type ValidImageType = (typeof VALID_IMAGE_TYPES)[number]
export type ValidDocumentType = (typeof VALID_DOCUMENT_TYPES)[number]
export type ValidFileType = (typeof VALID_FILE_TYPES)[number]

// File categories
export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document'
}

// Helper function
export function getMaxFileSize(mimeType: string): number {
  if (VALID_IMAGE_TYPES.includes(mimeType as any)) {
    return MAX_IMAGE_SIZE
  }
  if (VALID_DOCUMENT_TYPES.includes(mimeType as any)) {
    return MAX_DOCUMENT_SIZE
  }
  return MAX_IMAGE_SIZE // default
}
