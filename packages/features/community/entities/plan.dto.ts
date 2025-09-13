import { idSchema } from 'core'
import { z } from 'zod'

export type PlanDto = z.infer<typeof planSchema>

export const planSchema = z.object({
  id: idSchema,
  name: z.string()
})
