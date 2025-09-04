import type { Command } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import type { IssueCreateRepository } from '@/src/features/issue/domain/issue-create.repository'

export class CreateIssueCmd implements Command<CreateIssueSchema> {
  static readonly ID = 'CreateIssueCmd'

  constructor(private readonly issueRepository: IssueCreateRepository) {}

  async handle(issue: CreateIssueSchema): Promise<void> {
    return this.issueRepository.create(issue)
  }
}
