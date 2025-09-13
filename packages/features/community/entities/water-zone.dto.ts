import { idSchema } from 'core'
import z from 'zod'
import { communitySchema } from './community.dto'

export type WaterZoneDto = z.infer<typeof waterZoneSchema>

export const waterZoneSchema = z.object({
  id: idSchema,
  community: communitySchema,
  name: z.string()
})
