import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { FeeFrequency } from '../value-objects/fee-frequency'
import { FeePaymentKind } from '../value-objects/fee-payment-kind'
import { PaymentMethod } from '../value-objects/payment-method'

const amountSchema = z.string().refine((value) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0
}, 'Amount must be greater than 0')

const feePaymentBaseSchema = z.object({
  id: idSchema,
  communityId: idSchema,
  number: z.number().int().positive(),
  waterPointId: idSchema,
  payerLabel: z.string().min(1, 'Payer label is required'),
  kind: z.enum(FeePaymentKind.values() as [string, ...string[]]),
  amount: amountSchema,
  paidAt: z.coerce.date(),
  frequency: z
    .enum(FeeFrequency.values() as [string, ...string[]])
    .nullable()
    .optional(),
  periodYear: z.number().int().nullable().optional(),
  periodIndex: z.number().int().nullable().optional(),
  paymentMethod: z.enum(PaymentMethod.values() as [string, ...string[]]),
  notes: z.string().optional().default('')
})

function refineFeePaymentPeriod(
  data: {
    kind: string
    frequency?: string | null
    periodYear?: number | null
    periodIndex?: number | null
  },
  ctx: z.RefinementCtx
) {
  if (data.kind === 'PERIODIC') {
    if (!data.frequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Frequency is required for periodic payments',
        path: ['frequency']
      })
    }
    if (data.periodYear == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Period year is required for periodic payments',
        path: ['periodYear']
      })
    }
    if (data.periodIndex == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Period index is required for periodic payments',
        path: ['periodIndex']
      })
    } else if (data.frequency && FeeFrequency.isValid(data.frequency)) {
      try {
        FeeFrequency.assertPeriodIndex(FeeFrequency.fromString(data.frequency), data.periodIndex)
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : 'Invalid period index',
          path: ['periodIndex']
        })
      }
    }
  } else {
    if (data.frequency != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Frequency must be null for non-periodic payments',
        path: ['frequency']
      })
    }
    if (data.periodYear != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Period year must be null for non-periodic payments',
        path: ['periodYear']
      })
    }
    if (data.periodIndex != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Period index must be null for non-periodic payments',
        path: ['periodIndex']
      })
    }
  }
}

export const feePaymentSchema = feePaymentBaseSchema.superRefine(refineFeePaymentPeriod)

export type FeePaymentDto = z.infer<typeof feePaymentSchema>

export const feePaymentCreateSchema = feePaymentBaseSchema
  .omit({ id: true, number: true })
  .superRefine(refineFeePaymentPeriod)

export type FeePaymentCreateDto = z.infer<typeof feePaymentCreateSchema>

export const feePaymentUpdateSchema = feePaymentBaseSchema
  .omit({ id: true, number: true, communityId: true })
  .superRefine(refineFeePaymentPeriod)

export type FeePaymentUpdateDto = z.infer<typeof feePaymentUpdateSchema>
