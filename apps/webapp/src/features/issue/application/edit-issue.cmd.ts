import type { Command } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'

export class EditIssueCmd implements Command<Issue> {
  static readonly ID = 'EditIssueCmd'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(issue: Issue): Promise<void> {
    return this.issueRepository.save(issue)
  }
}
