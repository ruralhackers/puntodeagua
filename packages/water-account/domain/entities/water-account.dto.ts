import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type WaterAccountDto = z.infer<typeof waterAccountSchema>

export const waterAccountSchema = z.object({
  id: idSchema,
  name: z.string(),
  nationalId: z.string(),
  notes: z.string().optional()
})
