export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const DEFAULT_FILE_EXTENSION = 'jpg'

export type ValidImageType = (typeof VALID_IMAGE_TYPES)[number]

