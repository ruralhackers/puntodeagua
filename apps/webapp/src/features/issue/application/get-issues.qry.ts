import type { Query } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'

export class GetIssuesQry implements Query<Issue[]> {
  static readonly ID = 'GetIssuesQry'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(): Promise<Issue[]> {
    const issues = await this.issueRepository.findAll()
    return issues
  }
}
