import { decimalSchema, idSchema } from 'core'
import { z } from 'zod'
import type { FileAttachmentSchema } from './file-attachment.schema'

export interface WaterMeterReadingSchema {
  id: string
  waterMeterId: string
  reading: string
  normalizedReading: string
  readingDate: string
  notes?: string
  attachments?: FileAttachmentSchema[]
}

export interface CreateWaterMeterReadingDto {
  waterMeterId: string
  reading: string
  readingDate: string
  notes?: string
  files?: UploadedFile[]
}

export interface UploadedFile {
  originalName: string
  mimeType: string
  size: number
  buffer: Buffer
}

export const waterMeterReadingSchema = z.object({
  id: idSchema,
  waterMeterId: idSchema,
  // TODO: Handle decimals
  value: decimalSchema
})
