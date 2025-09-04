import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetWaterMeterQry } from '../application/get-water-meter.qry'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'

export const waterMeterApiRest = new Elysia()
  .get('/water-meters', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const waterMeters = await useCaseService.execute(GetWaterMetersQry)
    return waterMeters.map((x) => x.toDto())
  })
  .get('/water-meter/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const waterMeter = await useCaseService.execute(GetWaterMeterQry, params.id)
    return waterMeter?.toDto() ?? null
  })
