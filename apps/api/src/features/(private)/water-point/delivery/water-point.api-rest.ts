import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterPointsFiltersSchema } from 'features'
import { apiContainer } from '../../../../api.container'
import { GetWaterPointQry } from '../application/get-water-point.qry'
import { GetWaterPointsQry } from '../application/get-water-points.qry'

export const waterPointApiRest = new Elysia({
  prefix: '/water-points'
})
  .get('/', async ({ query }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const filters = getWaterPointsFiltersSchema.parse(query)
    const waterPoints = await useCaseService.execute(GetWaterPointsQry, filters)
    return waterPoints.map((x) => x.toDto())
  })
  .get('/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const waterPoint = await useCaseService.execute(GetWaterPointQry, {
      id: params.id
    })
    return waterPoint.toDto()
  })
