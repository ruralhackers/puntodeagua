import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { createIssueSchema, issueSchema } from 'features'
import { IssueStatusType } from 'features/issues/value-objects/issue-status-type'
import { ISSUE_REPOSITORY } from 'webapp/src/core/di/injection-tokens'
import { GetIssueByIdQry } from 'webapp/src/features/issue/application/get-issue-by-id.qry'
import { apiContainer } from '../../../api.container'
import { EditIssueCmd } from '../application/edit-issue.cmd'
import { GetIssuesQry } from '../application/get-issues.qry'
import { SaveIssueCmd } from '../application/save-issue.cmd'
import type { IssueApiRepository } from '../domain/issue.api-repository'

export const issueApiRest = new Elysia()
  .get('/issues/', async ({ query, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Handle optional status query parameter
    if (query.status && typeof query.status === 'string') {
      if (IssueStatusType.isValidType(query.status)) {
        const status = IssueStatusType.create(query.status)
        const issues = await useCaseService.execute(GetIssuesQry, { status })
        return issues.map((x) => x.toDto())
      } else {
        return {
          status: 400,
          body: { message: `Invalid status. Valid values are: ${['open', 'closed'].join(', ')}` }
        }
      }
    }

    // If no status filter is provided, get all issues ordered by end date
    const issueRepository = apiContainer.get<IssueApiRepository>(ISSUE_REPOSITORY)
    const communityId = user.communityId ? Id.create(user.communityId) : undefined
    if (!communityId) {
      return {
        status: 400,
        body: { message: 'Community ID is required' }
      }
    }
    const issues = await issueRepository.findAllOrderedByEndAt(communityId)
    return issues.map((x) => x.toDto())
  })
  .get('/issues/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const issue = await useCaseService.execute(GetIssueByIdQry, Id.create(params.id))

    if (!issue) {
      return { status: 404, body: { message: 'Issue not found' } }
    }
    return issue.toDto()
  })
  .post('/issues/', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = createIssueSchema.parse(body)
    await useCaseService.execute(SaveIssueCmd, dto)
  })
  .put('/issues/:id', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = issueSchema.parse(body)
    await useCaseService.execute(EditIssueCmd, dto)
  })
