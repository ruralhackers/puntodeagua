import type { Command } from 'core'
import { Issue } from 'features'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import type { IssueApiRepository } from '../domain/issue.api-repository'

export class SaveIssueCmd implements Command<CreateIssueSchema> {
  static readonly ID = 'SaveIssueCmd'

  constructor(private readonly issueApiRepository: IssueApiRepository) {}

  async handle(createIssue: CreateIssueSchema): Promise<void> {
    const issue = Issue.create(createIssue)
    return this.issueApiRepository.save(issue)
  }
}
