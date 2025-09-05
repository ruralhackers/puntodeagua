import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { authMiddleware } from '../../../middleware/auth.middleware'
import { GetWaterPointsQry } from '../application/get-water-points.qry'

export const waterPointApiRest = authMiddleware(new Elysia()).get(
  '/water-points',
  async ({ set }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const waterPoints = await useCaseService.execute(GetWaterPointsQry)
    return waterPoints.map((x) => x.toDto())
  }
)
