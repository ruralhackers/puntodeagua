import type { Id, Query } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import type { IssueApiRepository } from '../domain/issue.api-repository'

export class GetIssueByIdQry implements Query<Issue, Id> {
  static readonly ID = 'GetIssueByIdQry'

  constructor(private readonly issueApiRepository: IssueApiRepository) {}

  async handle(id: Id): Promise<Issue> {
    const issue = await this.issueApiRepository.findById(id)

    if (issue === undefined) {
      throw new Error('Issue not found')
    }

    return issue
  }
}
