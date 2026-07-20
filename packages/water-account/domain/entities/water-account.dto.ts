import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type WaterAccountDto = z.infer<typeof waterAccountSchema>

export const waterAccountSchema = z.object({
  id: idSchema,
  name: z.string().min(1, 'Name is required'),
  nationalId: z.string(),
  phone: z.string().optional(),
  notes: z.string().optional()
})

export const waterAccountUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nationalId: z.string(),
  phone: z.string().optional(),
  notes: z.string().optional()
})

export type WaterAccountUpdateDto = z.infer<typeof waterAccountUpdateSchema>
