import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterMetersFiltersSchema } from 'features'
import { apiContainer } from '../../../api.container'
import { authMiddleware } from '../../../middleware/auth.middleware'
import { GetWaterMeterQry } from '../application/get-water-meter.qry'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'

interface AuthenticatedUser {
  userId: string
  email: string
  roles: string[]
  communityId: string | null
}

export const waterMeterApiRest = authMiddleware(new Elysia())
  .get('/water-meters', async ({ query, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Parse and validate query parameters
    const filters = getWaterMetersFiltersSchema.parse(query)

    // Add community filter for non-super-admin users
    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    const authenticatedUser = user as AuthenticatedUser
    if (authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')) {
      filters.communityId = authenticatedUser.communityId
    }

    const waterMeters = await useCaseService.execute(GetWaterMetersQry, filters)
    return waterMeters.map((x) => x.toDto())
  })
  .get('/water-meter/:id', async ({ params, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    const authenticatedUser = user as AuthenticatedUser
    const queryParams = {
      id: params.id,
      communityId:
        authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN') ? authenticatedUser.communityId : undefined
    }

    const waterMeter = await useCaseService.execute(GetWaterMeterQry, queryParams)
    return waterMeter?.toDto() ?? null
  })
