import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterMetersFiltersSchema } from 'features'
import { apiContainer } from '../../../../api.container'
import { GetWaterMeterQry } from '../application/get-water-meter.qry'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'

export const waterMeterApiRest = new Elysia({ prefix: '/water-meters' })
  .get('/', async ({ query, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Parse and validate query parameters
    const filters = getWaterMetersFiltersSchema.parse(query)

    if (user.communityId && !user.roles.includes('SUPER_ADMIN')) {
      filters.communityId = user.communityId
    }

    const waterMeters = await useCaseService.execute(GetWaterMetersQry, filters)
    return waterMeters.map((x) => x.toDto())
  })
  .get('/:id', async ({ params, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    const queryParams = {
      id: params.id,
      communityId:
        user.communityId && !user.roles.includes('SUPER_ADMIN') ? user.communityId : undefined
    }

    const waterMeter = await useCaseService.execute(GetWaterMeterQry, queryParams)
    return waterMeter?.toDto() ?? null
  })
