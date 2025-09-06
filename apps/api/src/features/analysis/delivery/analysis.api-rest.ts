import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { z } from 'zod'
import { apiContainer } from '../../../api.container'
import { CreateAnalysisCmd } from '../application/create-analysis.cmd'
import { DeleteAnalysisCmd } from '../application/delete-analysis.cmd'
import { EditAnalysisCmd } from '../application/edit-analysis.cmd'
import { GetAnalysesQry } from '../application/get-analyses.qry'
import { GetAnalysisQry } from '../application/get-analysis.qry'

export const analysisApiRest = new Elysia()
  .get('/analyses', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const analysis = await useCaseService.execute(GetAnalysesQry)
    return analysis.map((x) => x.toDto())
  })
  .get('/analyses/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const analysis = await useCaseService.execute(GetAnalysisQry, Id.create(params.id))
    if (!analysis) {
      return { status: 404, body: { message: 'Analysis not found' } }
    }
    return analysis.toDto()
  })
  .post('/analyses', async ({ body, set }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const createAnalysisSchema = analysisSchema.omit({ id: true })
    const dto = createAnalysisSchema.parse(body)
    await useCaseService.execute(CreateAnalysisCmd, dto)
    return
  })
  .post('/analyses/:id', async ({ body, params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = analysisSchema.parse(body)
    await useCaseService.execute(EditAnalysisCmd, dto)
    return
  })
  .delete('/analyses/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    await useCaseService.execute(DeleteAnalysisCmd, Id.create(params.id))
    return
  })
