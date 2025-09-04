import type { Command } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/repositories/issue.repository'

export class SaveIssueCmd implements Command<Issue> {
  static readonly ID = 'SaveIssueCmd'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(issue: Issue): Promise<void> {
    return this.issueRepository.save(issue)
  }
}
