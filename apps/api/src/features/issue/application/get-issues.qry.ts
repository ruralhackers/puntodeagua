import type { Id, Query } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import type { IssueStatusType } from 'features/issues/value-objects/issue-status-type'

export class GetIssuesQry implements Query<Issue[], { status: IssueStatusType }> {
  static readonly ID = 'GetIssuesQry'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(filters: { status: IssueStatusType }): Promise<Issue[]> {
    const issues = await this.issueRepository.findAll({ status: filters.status })
    return issues
  }
}
