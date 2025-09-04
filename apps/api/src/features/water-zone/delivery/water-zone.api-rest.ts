import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetWaterZonesQry } from '../application/get-water-zones.qry'

export const waterZonesApiRest = new Elysia().get('/water-zones', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const waterZones = await useCaseService.execute(GetWaterZonesQry)
  return waterZones.map((x) => x.toDto())
})
