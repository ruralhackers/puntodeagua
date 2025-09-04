import type { Command } from 'core'
import { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'

export class SaveIssueCmd implements Command<CreateIssueSchema> {
  static readonly ID = 'SaveIssueCmd'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(createIssue: CreateIssueSchema): Promise<void> {
    const issue = Issue.create(createIssue)
    return this.issueRepository.save(issue)
  }
}
