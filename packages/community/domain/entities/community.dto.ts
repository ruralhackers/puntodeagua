import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type CommunityDto = z.infer<typeof communitySchema>

export const communitySchema = z.object({
  id: idSchema,
  name: z.string(),
  waterLimitRule: z.object({
    type: z.string(),
    value: z.number()
  })
})
