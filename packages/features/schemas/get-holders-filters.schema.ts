import { z } from 'zod'

export type GetHoldersFiltersDto = z.infer<typeof getHoldersFiltersSchema>

export const getHoldersFiltersSchema = z.object({
  communityId: z.string().optional(),
  name: z.string().optional(),
  nationalId: z.string().optional()
})
