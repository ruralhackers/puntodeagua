import { z } from 'zod'

export type GetWaterPointsFiltersDto = z.infer<typeof getWaterPointsFiltersSchema>

export const getWaterPointsFiltersSchema = z.object({
  communityId: z.string().optional(),
  name: z.string().optional()
})
