import type { Id } from '@pda/common/domain'
import { Issue } from '../domain/entities/issue'
import type { IssueRepository } from '../domain/repositories/issue.repository'

export class IssueUpdater {
  constructor(private readonly issueRepository: IssueRepository) {}

  async run(params: { id: Id; updatedIssue: Issue }): Promise<Issue> {
    const { id, updatedIssue } = params

    const existingIssue = await this.issueRepository.findById(id)
    if (!existingIssue) {
      throw new Error(`Issue with id ${id.toString()} not found`)
    }

    // Create merged issue with existing values as fallback
    const mergedIssue = Issue.fromDto({
      id: id.toString(),
      title: updatedIssue.title,
      reporterName: updatedIssue.reporterName,
      startAt: updatedIssue.startAt,
      communityId: existingIssue.communityId.toString(), // Keep existing community
      waterZoneId: updatedIssue.waterZoneId?.toString() ?? existingIssue.waterZoneId?.toString(),
      waterDepositId:
        updatedIssue.waterDepositId?.toString() ?? existingIssue.waterDepositId?.toString(),
      waterPointId: updatedIssue.waterPointId?.toString() ?? existingIssue.waterPointId?.toString(),
      description: updatedIssue.description ?? existingIssue.description,
      status: updatedIssue.status.toString(),
      endAt: updatedIssue.endAt ?? existingIssue.endAt
    })

    await this.issueRepository.save(mergedIssue)
    return mergedIssue
  }
}
