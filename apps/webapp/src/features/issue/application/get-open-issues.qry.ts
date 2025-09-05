import type { Query } from 'core'
import type { Issue, IssueRepositoryFilters } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import { IssueStatusType } from 'features/issues/value-objects/issue-status-type'

export class GetOpenIssuesQry implements Query<Issue[]> {
  static readonly ID = 'GetOpenIssuesQry'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(): Promise<Issue[]> {
    const issues = await this.issueRepository.findAll({ status: IssueStatusType.create('open') })
    return issues
  }
}
