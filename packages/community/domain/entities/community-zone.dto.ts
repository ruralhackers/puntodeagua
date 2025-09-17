import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type CommunityZoneDto = z.infer<typeof communityZoneSchema>

export const communityZoneSchema = z.object({
  id: idSchema,
  name: z.string(),
  communityId: idSchema,
  notes: z.string().default('')
})
