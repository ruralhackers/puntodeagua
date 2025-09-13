import { decimalSchema, idSchema } from 'core'
import { fileSchema } from 'core/entities/file.dto'
import { z } from 'zod'

export type WaterMeterReadingDto = z.infer<typeof waterMeterReadingSchema>

export const waterMeterReadingSchema = z.object({
  id: idSchema,
  waterMeterId: idSchema,
  reading: decimalSchema,
  normalizedReading: decimalSchema,
  readingDate: z.date(),
  notes: z.string().optional(),
  files: z.array(fileSchema).optional().default([]).optional(),
  consumption: z.number().optional(),
  excessConsumption: z.boolean().optional()
})
