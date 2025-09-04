import { z } from 'zod'

export type GetWaterMetersFiltersDto = z.infer<typeof getWaterMetersFiltersSchema>

export const getWaterMetersFiltersSchema = z.object({
  zoneId: z.string().optional(),
  name: z.string().optional()
})
