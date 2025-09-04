import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { apiContainer } from '../../../api.container'
import { CreateAnalysisCmd } from '../application/create-analisys.cmd'
import { GetAnalysesQry } from '../application/get-analyses.qry'

export const analysisApiRest = new Elysia()
  .get('/analyses', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const analysis = await useCaseService.execute(GetAnalysesQry)
    return analysis.map((x) => x.toDto())
  })
  .post('/analyses', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const createAnalysisSchema = analysisSchema.omit({ id: true })
    const dto = createAnalysisSchema.parse(body)
    await useCaseService.execute(CreateAnalysisCmd, dto)
    return { ok: true }
  })
