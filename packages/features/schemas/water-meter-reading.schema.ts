import { decimalSchema, idSchema } from 'core'
import { z } from 'zod'

export type WaterMeterReadingSchema = z.infer<typeof waterMeterReadingSchema>

export const waterMeterReadingSchema = z.object({
  id: idSchema,
  waterMeterId: idSchema,
  reading: decimalSchema,
  normalizedReading: decimalSchema,
  readingDate: z.date(),
  notes: z.string().optional()
})
