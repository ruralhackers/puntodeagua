import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetWaterPointsQry } from '../application/get-water-points.qry'

export const waterPointApiRest = new Elysia().get('/water-points', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const waterPoints = await useCaseService.execute(GetWaterPointsQry)
  return waterPoints.map((x) => x.toDto())
})
