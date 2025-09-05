import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetRegistrosStatsQry } from '../application/get-registros-stats.qry'

export const registrosApiRest = new Elysia().get('/registros/stats', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  return await useCaseService.execute(GetRegistrosStatsQry)
})
