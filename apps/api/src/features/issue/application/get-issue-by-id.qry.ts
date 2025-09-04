import type { Id, Query } from 'core'
import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'

export class GetIssueByIdQry implements Query<Issue, Id> {
  static readonly ID = 'GetIssueByIdQry'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(id: Id): Promise<Issue> {
    const issue = await this.issueRepository.findById(id)

    if (issue === undefined) {
      throw new Error('Issue not found')
    }

    return issue
  }
}
