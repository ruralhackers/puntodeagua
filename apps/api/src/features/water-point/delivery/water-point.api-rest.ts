import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterPointsFiltersSchema } from 'features'
import { apiContainer } from '../../../api.container'
import { GetWaterPointQry } from '../application/get-water-point.qry'
import { GetWaterPointsQry } from '../application/get-water-points.qry'

export const waterPointApiRest = new Elysia()
  .get('/water-points', async ({ query, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    console.log('hit')

    // Parse and validate query parameters
    const filters = getWaterPointsFiltersSchema.parse(query)

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

    const waterPoints = await useCaseService.execute(GetWaterPointsQry, filters)
    console.log({ waterPoints })
    return waterPoints.map((x) => x.toDto())
  })
  .get('/water-points/:id', async ({ params, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

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
    const communityId =
      authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')
        ? authenticatedUser.communityId
        : undefined

    const waterPoint = await useCaseService.execute(GetWaterPointQry, {
      id: params.id,
      communityId
    })

    if (!waterPoint) {
      return { error: 'Water point not found' }
    }

    return waterPoint.toDto()
  })
