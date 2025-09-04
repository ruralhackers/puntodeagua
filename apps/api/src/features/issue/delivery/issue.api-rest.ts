import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { Issue, issueSchema } from 'features'
import { apiContainer } from '../../../api.container'
import { SaveIssueCmd } from '../application/save-issue.cmd'

export const issueApiRest = new Elysia().post('/issues', async ({ body }) => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const issueSchemaDto = issueSchema.parse(body)
  const issue = Issue.fromDto(issueSchemaDto)
  await useCaseService.execute(SaveIssueCmd, issue)
})
