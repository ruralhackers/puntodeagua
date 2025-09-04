import { idSchema } from 'core'
import { z } from 'zod'

export type CommunitySchema = z.infer<typeof communitySchema>

export const communitySchema = z.object({
  id: idSchema,
  name: z.string(),
  planId: idSchema,
  dailyWaterLimitLitersPerPerson: z.number().int().positive()
})
