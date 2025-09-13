import { idSchema } from 'core'
import { locationSchema } from 'core/types/location.schema.ts'
import { z } from 'zod'

export type WaterPointDto = z.infer<typeof waterPointSchema>

export const waterPointSchema = z.object({
  id: idSchema,
  location: locationSchema,
  name: z.string(),
  description: z.string().optional(),
  communityId: idSchema,
  fixedPopulation: z.number().int().min(0),
  floatingPopulation: z.number().int().min(0)
})
