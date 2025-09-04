import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { UseCaseService } from 'core'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'

export const waterMeterApiRest = new Elysia().get('/water-meters', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const waterMeters = await useCaseService.execute(GetWaterMetersQry)
  return waterMeters.map((x) => x.toDto())
})