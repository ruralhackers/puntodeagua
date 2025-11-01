/**
 * Shared types and constants for image upload functionality
 *
 * This file re-exports constants from @pda/storage to ensure
 * a single source of truth across frontend and backend
 */

import {
  MAX_FILE_SIZE,
  VALID_IMAGE_TYPES as STORAGE_VALID_IMAGE_TYPES,
  type ValidImageType
} from '@pda/storage'

// Re-export constants from storage package
export const VALID_IMAGE_TYPES = STORAGE_VALID_IMAGE_TYPES
export const MAX_IMAGE_SIZE = MAX_FILE_SIZE
export const ACCEPTED_FILE_TYPES = VALID_IMAGE_TYPES.join(',')

// Re-export type
export type { ValidImageType }

// Frontend-specific types
export interface ImageUploadData {
  file: Uint8Array
  metadata: {
    fileSize: number
    mimeType: string
    originalName: string
  }
}

export interface ImagePreviewData {
  url: string
  fileName: string
  fileSize: number
  uploadedAt: Date
}
