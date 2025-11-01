import { z } from 'zod'

export const waterMeterImageSchema = z.object({
  id: z.string().cuid2(),
  waterMeterId: z.string().cuid2(),
  url: z.string().url(),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  uploadedAt: z.date(),
  externalKey: z.string().min(1)
})

export type WaterMeterImageDto = z.infer<typeof waterMeterImageSchema>
