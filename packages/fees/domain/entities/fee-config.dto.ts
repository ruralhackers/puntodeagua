import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { FeeFrequency } from '../value-objects/fee-frequency'

export const feeConfigSchema = z.object({
  id: idSchema,
  communityId: idSchema,
  annualAmount: z.string().refine((value) => {
    const n = Number(value)
    return Number.isFinite(n) && n > 0
  }, 'Annual amount must be greater than 0'),
  frequency: z.enum(FeeFrequency.values() as [string, ...string[]]),
  currency: z.string().default('EUR')
})

export type FeeConfigDto = z.infer<typeof feeConfigSchema>

export const feeConfigUpsertSchema = z.object({
  communityId: idSchema,
  annualAmount: z.string().refine((value) => {
    const n = Number(value)
    return Number.isFinite(n) && n > 0
  }, 'Annual amount must be greater than 0'),
  frequency: z.enum(FeeFrequency.values() as [string, ...string[]]),
  currency: z.string().default('EUR')
})

export type FeeConfigUpsertDto = z.infer<typeof feeConfigUpsertSchema>
