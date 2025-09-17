import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { waterMeterReadingSchema } from './water-meter-reading.dto'

export type WaterMeterDto = z.infer<typeof waterMeterSchema>

export const waterMeterSchema = z.object({
  id: idSchema,
  name: z.string(),
  waterAccountId: idSchema,
  waterPointId: idSchema,
  measurementUnit: z.string(),
  readings: z.array(waterMeterReadingSchema).optional(),
  lastReadingNormalizedValue: z.number().optional(),
  lastReadingDate: z.date().optional(),
  lastReadingExcessConsumption: z.boolean().optional()
})
