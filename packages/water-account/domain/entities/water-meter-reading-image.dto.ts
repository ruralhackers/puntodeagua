import { z } from 'zod'

export const waterMeterReadingImageSchema = z.object({
  id: z.string().cuid2(),
  waterMeterReadingId: z.string().cuid2(),
  url: z.string().url(),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  uploadedAt: z.date(),
  externalKey: z.string().min(1)
})

export const waterMeterReadingNewImageSchema = z.object({
  file: z.instanceof(Uint8Array),
  metadata: z.object({
    fileSize: z.number(),
    mimeType: z.string(),
    originalName: z.string()
  })
})

export type WaterMeterReadingImageDto = z.infer<typeof waterMeterReadingImageSchema>
export type WaterMeterReadingNewImageDto = z.infer<typeof waterMeterReadingNewImageSchema>

