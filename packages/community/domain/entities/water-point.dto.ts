import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export type WaterPointDto = z.infer<typeof waterPointSchema>

export const waterPointSchema = z.object({
  id: idSchema,
  name: z.string(),
  location: z.string(), // raw string, e.g. "lat,lng"; consider VO later
  notes: z.string().optional(),
  fixedPopulation: z.number().int().min(0),
  floatingPopulation: z.number().int().min(0),
  cadastralReference: z.string(),
  communityZoneId: idSchema
})
