import type { Id, Query } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import type { IssueStatusType } from 'features/issues/value-objects/issue-status-type'
import type { IssueApiRepository } from '../domain/issue.api-repository'

export class GetIssuesQry implements Query<Issue[], { status: IssueStatusType }> {
  static readonly ID = 'GetIssuesQry'

  constructor(private readonly issueApiRepository: IssueApiRepository) {}

  async handle(filters: { status: IssueStatusType }): Promise<Issue[]> {
    const issues = await this.issueApiRepository.findAll({ status: filters.status })
    return issues
  }
}
