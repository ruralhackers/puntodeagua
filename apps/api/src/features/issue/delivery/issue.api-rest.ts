import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { createIssueSchema, issueSchema } from 'features'
import { IssueStatusType } from 'features/issues/value-objects/issue-status-type'
import { IssueRepository } from 'features/issues/repositories/issue.repository'
import { GetIssueByIdQry } from 'webapp/src/features/issue/application/get-issue-by-id.qry'
import { apiContainer } from '../../../api.container'
import { GetIssuesQry } from '../application/get-issues.qry'
import { SaveIssueCmd } from '../application/save-issue.cmd'

export const issueApiRest = new Elysia({ prefix: '/issues' })
  .get('/', async ({ query }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Handle optional status query parameter
    if (query.status && typeof query.status === 'string') {
      if (IssueStatusType.isValidType(query.status)) {
        const status = IssueStatusType.create(query.status)
        const issues = await useCaseService.execute(GetIssuesQry, { status })
        return issues.map((x) => x.toDto())
      } else {
        return { status: 400, body: { message: `Invalid status. Valid values are: ${['open', 'closed'].join(', ')}` } }
      }
    }

    // If no status filter is provided, get all issues ordered by end date
    const issueRepository = apiContainer.get<IssueRepository>('IssueRepository')
    const issues = await issueRepository.findAllOrderedByEndAt()
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
