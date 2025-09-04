import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetAnalysesQry } from '../application/get-analyses.qry'

export const analysisApiRest = new Elysia().get('/analyses', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const analysis = await useCaseService.execute(GetAnalysesQry)
  return analysis.map((x) => x.toDto())
})
