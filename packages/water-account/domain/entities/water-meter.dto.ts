import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type WaterMeterDto = z.infer<typeof waterMeterSchema>

export const waterMeterSchema = z.object({
  id: idSchema,
  name: z.string(),
  waterAccountId: idSchema,
  waterPointId: idSchema,
  measurementUnit: z.string(),
  lastReadingNormalizedValue: z.number().nullable(),
  lastReadingDate: z.date().nullable(),
  lastReadingExcessConsumption: z.boolean().nullable()
})
