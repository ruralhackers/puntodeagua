import { idSchema } from 'core'
import { z } from 'zod'

export type ProviderSchema = z.infer<typeof providerSchema>

export const providerSchema = z.object({
  id: idSchema,
  communityId: idSchema,
  name: z.string(),
  phone: z.string().optional(),
  description: z.string().optional()
})
