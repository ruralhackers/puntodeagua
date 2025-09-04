import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { z } from 'zod'
import { apiContainer } from '../../../api.container'
import { CreateAnalysisCmd } from '../application/create-analisys.cmd'
import { GetAnalysesQry } from '../application/get-analyses.qry'
import { GetAnalysisQry } from '../application/get-analysis.qry'

export const analysisApiRest = new Elysia()
  .get('/analyses', async () => {
    console.log('voy aqui')
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const analysis = await useCaseService.execute(GetAnalysesQry)
    return analysis.map((x) => x.toDto())
  })
  .get('/analyses/:id', async ({ params }) => {
    console.log({ params })
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const analysis = await useCaseService.execute(GetAnalysisQry, { id: Id.create(params.id) })
    if (!analysis) {
      return { status: 404, body: { message: 'Analysis not found' } }
    }
    return analysis.toDto()
  })
  .post('/analyses', async ({ body, set }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const createAnalysisSchema = analysisSchema
      .omit({ id: true })
      .extend({ analyzedAt: z.coerce.date() })
    const dto = createAnalysisSchema.parse(body)
    await useCaseService.execute(CreateAnalysisCmd, dto)
    return
  })
