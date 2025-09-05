import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../../api.container'
import { GetSummaryQry } from '../application/get-summary.qry'

export const summaryApiRest = new Elysia().get('/summary', async ({ query }) => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

  // Parse query parameters if provided
  const params = {
    month: query.month ? parseInt(query.month as string) : undefined,
    year: query.year ? parseInt(query.year as string) : undefined
  }

  const summary = await useCaseService.execute(GetSummaryQry, params)
  return {
    analyses: summary.analyses.map((x) => x.toDto()),
    issues: summary.issues.map((x) => x.toDto()),
    maintenance: summary.maintenance.map((x) => x.toDto())
  }
})
