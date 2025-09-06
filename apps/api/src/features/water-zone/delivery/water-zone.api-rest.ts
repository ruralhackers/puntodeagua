import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterZonesFiltersSchema } from 'features'
import { apiContainer } from '../../../api.container'
import { GetWaterZonesQry } from '../application/get-water-zones.qry'

export const waterZonesApiRest = new Elysia().get('/water-zones', async ({ query, user }) => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

  // Parse and validate query parameters
  const filters = getWaterZonesFiltersSchema.parse(query)

  // Add community filter for non-super-admin users
  if (!user || 'error' in user) {
    throw new Error('Authentication required')
  }

  // Type assertion after the guard
  const authenticatedUser = user as {
    userId: string
    email: string
    roles: string[]
    communityId: string | null
  }

  if (authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')) {
    filters.communityId = authenticatedUser.communityId
  }

  const waterZones = await useCaseService.execute(GetWaterZonesQry, filters)

  return waterZones.map((x) => x.toDto())
})
