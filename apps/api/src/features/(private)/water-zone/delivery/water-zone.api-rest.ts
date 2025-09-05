import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterZonesFiltersSchema } from 'features'
import { apiContainer } from '../../../../api.container'
import { GetWaterZonesQry } from '../application/get-water-zones.qry'

export const waterZonesApiRest = new Elysia({
  prefix: '/water-zones'
}).get('/', async ({ query }) => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const filters = getWaterZonesFiltersSchema.parse(query)
  const waterZones = await useCaseService.execute(GetWaterZonesQry, filters)
  return waterZones.map((x) => x.toDto())
})
