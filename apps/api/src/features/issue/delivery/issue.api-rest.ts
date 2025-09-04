import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { createIssueSchema, issueSchema } from 'features'
import { GetIssueByIdQry } from 'webapp/src/features/issue/application/get-issue-by-id.qry'
import { apiContainer } from '../../../api.container'
import { GetAnalysesQry } from '../../analysis/application/get-analyses.qry'
import { SaveIssueCmd } from '../application/save-issue.cmd'

export const issueApiRest = new Elysia({ prefix: '/issues' })
  .get('/', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const issues = await useCaseService.execute(GetAnalysesQry)
    return issues.map((x) => x.toDto())
  })
  .get('/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const issue = await useCaseService.execute(GetIssueByIdQry, Id.create(params.id))

    if (!issue) {
      return { status: 404, body: { message: 'Issue not found' } }
    }
    return issue.toDto()
  })
  .post('/', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = createIssueSchema.parse(body)
    await useCaseService.execute(SaveIssueCmd, dto)
  })
  .put('/:id', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = issueSchema.parse(body)
    await useCaseService.execute(SaveIssueCmd, dto)
  })
