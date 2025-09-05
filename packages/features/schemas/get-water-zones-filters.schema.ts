import { z } from 'zod'

export type GetWaterZonesFiltersDto = z.infer<typeof getWaterZonesFiltersSchema>

export const getWaterZonesFiltersSchema = z.object({
  communityId: z.string().optional()
})
