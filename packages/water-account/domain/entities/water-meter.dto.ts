import { idSchema } from '@pda/common/domain'
import { waterPointSchema } from '@pda/community/domain'
import { z } from 'zod'
import { waterMeterImageSchema } from './water-meter-image.dto'

export type WaterMeterDto = z.infer<typeof waterMeterSchema>

export const waterMeterSchema = z.object({
  id: idSchema,
  name: z.string(),
  waterAccountId: idSchema,
  measurementUnit: z.string(),
  lastReadingNormalizedValue: z.number().nullable(),
  lastReadingDate: z.date().nullable(),
  lastReadingExcessConsumption: z.boolean().nullable(),
  isActive: z.boolean(),
  waterPoint: waterPointSchema,
  waterMeterImage: waterMeterImageSchema.nullable().optional()
})
