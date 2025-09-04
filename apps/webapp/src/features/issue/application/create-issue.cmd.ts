import type { Command } from 'core'
import { CreateIssueDto, IssueDto } from 'features'
import { IssueRepository } from 'features/repositories/issue.repository'

export class CreateIssueCmd implements Command<CreateIssueDto> {
  static readonly ID = 'CreateIssueCmd'

  constructor(private readonly issueRepository: IssueRepository) {}

  async handle(createIssueSchema: IssueDto): Promise<void> {
    return this.issueRepository.save(createIssueSchema)
  }
}
