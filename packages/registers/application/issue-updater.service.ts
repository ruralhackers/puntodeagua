import type { Id } from '@pda/common/domain'
import { Issue } from '../domain/entities/issue'
import type { IssueRepository } from '../domain/repositories/issue.repository'

export interface IssueUpdaterParams {
  id: Id
  title?: string
  reporterName?: string
  startAt?: Date
  waterZoneId?: Id
  waterDepositId?: Id
  waterPointId?: Id
  description?: string
  status?: 'open' | 'closed'
  endAt?: Date
}

export class IssueUpdater {
  constructor(private readonly issueRepository: IssueRepository) {}

  async run(params: IssueUpdaterParams): Promise<Issue> {
    const existingIssue = await this.issueRepository.findById(params.id)
    if (!existingIssue) {
      throw new Error(`Issue with id ${params.id.toString()} not found`)
    }

    // Create updated issue with new values
    const updatedIssue = Issue.fromDto({
      id: params.id.toString(),
      title: params.title ?? existingIssue.title,
      reporterName: params.reporterName ?? existingIssue.reporterName,
      startAt: params.startAt ?? existingIssue.startAt,
      communityId: existingIssue.communityId.toString(),
      waterZoneId: params.waterZoneId?.toString() ?? existingIssue.waterZoneId?.toString(),
      waterDepositId: params.waterDepositId?.toString() ?? existingIssue.waterDepositId?.toString(),
      waterPointId: params.waterPointId?.toString() ?? existingIssue.waterPointId?.toString(),
      description: params.description ?? existingIssue.description,
      status: params.status ?? existingIssue.status.toString(),
      endAt: params.endAt ?? existingIssue.endAt
    })

    await this.issueRepository.save(updatedIssue)
    return updatedIssue
  }
}
