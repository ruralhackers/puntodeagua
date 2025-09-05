import type { Command } from 'core'
import { Issue, type IssueSchema } from 'features'
import type { IssueApiRepository } from '../domain/issue.api-repository'

export class EditIssueCmd implements Command<IssueSchema> {
  static readonly ID = 'EditIssueCmd'

  constructor(private readonly issueApiRepository: IssueApiRepository) {}

  async handle(issueSchema: IssueSchema): Promise<void> {
    return this.issueApiRepository.save(Issue.fromDto(issueSchema))
  }
}
