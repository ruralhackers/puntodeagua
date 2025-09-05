import { idSchema } from 'core'
import { z } from 'zod'

export type ProviderSchema = z.infer<typeof providerSchema>

export const providerSchema = z.object({
  id: idSchema,
  name: z.string(),
  phone: z.string(),
  description: z.string()
})
