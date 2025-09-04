import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetWaterPointsQry } from '../application/get-water-points.qry'
import { authMiddleware } from '../../../middleware/auth.middleware'

export const waterPointApiRest = authMiddleware(new Elysia())
  .get('/water-points', async ({ set }) => {
    try {
      const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
      const waterPoints = await useCaseService.execute(GetWaterPointsQry)
      return waterPoints.map((x) => x.toDto())
    } catch (error) {
      set.status = 500
      return { error: error instanceof Error ? error.message : 'Internal server error' }
    }
  })
