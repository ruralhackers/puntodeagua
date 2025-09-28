import type { Issue } from '../domain/entities/issue'
import type { IssueRepository } from '../domain/repositories/issue.repository'

export class IssueCreator {
  constructor(private readonly issueRepository: IssueRepository) {}

  async run(params: { issue: Issue }) {
    const { issue } = params
    await this.issueRepository.save(issue)
    return issue
  }
}
