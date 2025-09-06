import type { z } from 'zod'
import { analysisSchema } from './analysis.schema.ts'

export type CreateAnalysisSchema = z.infer<typeof createAnalysisSchema>

export const createAnalysisSchema = analysisSchema.omit({ id: true })
