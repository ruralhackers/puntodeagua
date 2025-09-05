import type { Query } from 'core'
import type { Issue, IssueRepositoryFilters } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'

export class GetIssuesQry implements Query<Issue[], { filters: IssueRepositoryFilters }> {
  static readonly ID = 'GetIssuesQry'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(filters: { filters: IssueRepositoryFilters }): Promise<Issue[]> {
    const issues = await this.issueRepository.findAll(filters)
    return issues
  }
}
