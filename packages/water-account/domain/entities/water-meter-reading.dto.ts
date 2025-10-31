import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { waterMeterReadingImageSchema } from './water-meter-reading-image.dto'

export type WaterMeterReadingDto = z.infer<typeof waterMeterReadingSchema>

export const waterMeterReadingSchema = z.object({
  id: idSchema,
  waterMeterId: idSchema,
  reading: z.string(),
  normalizedReading: z.number(),
  readingDate: z.date(),
  notes: z.string().nullable().optional(),
  waterMeterReadingImage: waterMeterReadingImageSchema.nullable().optional()
})

export const waterMeterReadingUpdateSchema = z.object({
  reading: z.string().optional(),
  notes: z.string().nullable().optional()
})

export type WaterMeterReadingUpdateDto = z.infer<typeof waterMeterReadingUpdateSchema>
