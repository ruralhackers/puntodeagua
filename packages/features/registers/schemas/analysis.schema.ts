import { idSchema } from 'core'
import z from 'zod'

export type AnalysisSchema = z.infer<typeof analysisSchema>

export const analysisSchema = z.object({
  id: idSchema,
  waterZoneId: idSchema,
  analysisType: z.string(),
  analyst: z.string(),
  analyzedAt: z.date(),
  ph: z.string().min(0).optional(),
  turbidity: z.string().min(0).optional(),
  chlorine: z.string().min(0).optional(),
  description: z.string().max(500).optional()
})
