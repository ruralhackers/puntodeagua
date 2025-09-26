import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type WaterMeterReadingDto = z.infer<typeof waterMeterReadingSchema>

export const waterMeterReadingSchema = z.object({
  id: idSchema,
  waterMeterId: idSchema,
  reading: z.string(),
  normalizedReading: z.number(),
  readingDate: z.date(),
  notes: z.string().nullable().optional()
})
