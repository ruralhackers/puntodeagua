import type { Command } from 'core'
import { CreateIssueDto, Issue } from 'features'
import { IssueRepository } from 'features/repositories/issue.repository'

export class CreateIssueCmd implements Command<CreateIssueDto> {
  static readonly ID = 'CreateIssueCmd'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(createIssueDto: CreateIssueDto): Promise<void> {
    const issue = Issue.create(createIssueDto)
    return this.issueRepository.save(issue)
  }
}
