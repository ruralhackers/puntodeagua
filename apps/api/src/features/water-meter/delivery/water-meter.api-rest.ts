import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterMetersFiltersSchema } from 'features'
import { apiContainer } from '../../../api.container'
import { authMiddleware } from '../../../middleware/auth.middleware'
import { GetWaterMeterQry } from '../application/get-water-meter.qry'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'

export const waterMeterApiRest = authMiddleware(new Elysia())
  .get('/water-meters', async ({ query }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Parse and validate query parameters
    const filters = getWaterMetersFiltersSchema.parse(query)

    const waterMeters = await useCaseService.execute(GetWaterMetersQry, filters)
    return waterMeters.map((x) => x.toDto())
  })
  .get('/water-meter/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const waterMeter = await useCaseService.execute(GetWaterMeterQry, params.id)
    return waterMeter?.toDto() ?? null
  })
