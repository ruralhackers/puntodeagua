import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { AnalysisType } from '../value-objects/analysis-type'

export type AnalysisDto = z.infer<typeof analysisSchema>

export const analysisSchema = z.object({
  id: idSchema,
  communityId: idSchema,
  communityZoneId: idSchema.optional(),
  waterDepositId: idSchema.optional(),
  analysisType: z.enum(AnalysisType.values() as [string, ...string[]]), // TODO - review this
  analyst: z.string(),
  analyzedAt: z.date(),
  ph: z.number().min(0).optional(),
  turbidity: z.number().min(0).optional(),
  chlorine: z.number().min(0).optional(),
  description: z.string().max(2000).optional()
})
