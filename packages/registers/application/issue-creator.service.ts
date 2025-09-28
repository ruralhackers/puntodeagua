import type { Id } from '@pda/common/domain'
import { Issue } from '../domain/entities/issue'
import type { IssueRepository } from '../domain/repositories/issue.repository'

export interface IssueCreatorParams {
  title: string
  reporterName: string
  startAt: Date
  communityId: Id
  waterZoneId?: Id
  waterDepositId?: Id
  waterPointId?: Id
  description?: string
  endAt?: Date
}

export class IssueCreator {
  constructor(private readonly issueRepository: IssueRepository) {}

  async run(params: IssueCreatorParams): Promise<Issue> {
    const issue = Issue.create({
      title: params.title,
      reporterName: params.reporterName,
      startAt: params.startAt,
      communityId: params.communityId.toString(),
      waterZoneId: params.waterZoneId?.toString(),
      waterDepositId: params.waterDepositId?.toString(),
      waterPointId: params.waterPointId?.toString(),
      description: params.description,
      endAt: params.endAt,
      status: 'open'
    })

    await this.issueRepository.save(issue)
    return issue
  }
}
