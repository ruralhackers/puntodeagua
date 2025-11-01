import { idSchema } from '@pda/common/domain'
import { waterPointSchema } from '@pda/community/domain'
import { z } from 'zod'
import { waterMeterImageSchema } from './water-meter-image.dto'

export type WaterMeterDisplayDto = z.infer<typeof waterMeterDisplaySchema>

export const waterMeterDisplaySchema = z.object({
  id: idSchema,
  waterAccountId: idSchema,
  waterAccountName: z.string(),
  measurementUnit: z.string(),
  lastReadingNormalizedValue: z.number().nullable(),
  lastReadingDate: z.date().nullable(),
  lastReadingExcessConsumption: z.boolean().nullable(),
  isActive: z.boolean(),
  waterPoint: waterPointSchema,
  waterMeterImage: waterMeterImageSchema.nullable().optional()
})
