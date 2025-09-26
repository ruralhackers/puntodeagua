import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type WaterDepositDto = z.infer<typeof waterDepositSchema>

export const waterDepositSchema = z.object({
  id: idSchema,
  name: z.string(),
  location: z.string(), // raw string, e.g. "lat,lng"; consider VO later
  notes: z.string().optional(),
  communityId: idSchema
})
