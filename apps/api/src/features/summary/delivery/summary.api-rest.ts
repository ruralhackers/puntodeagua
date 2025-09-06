import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetSummaryQry } from '../application/get-summary.qry'

export const summaryApiRest = new Elysia().get('/summary/:communityId', async ({ params }) => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const summary = await useCaseService.execute(GetSummaryQry, {
    communityId: Id.create(params.communityId)
  })
  console.log('summary en api rest', { summary })
  return {
    analyses: summary.analyses.map((x) => x.toDto()),
    issues: summary.issues.map((x) => x.toDto()),
    maintenance: summary.maintenance.map((x) => x.toDto())
  }
})
