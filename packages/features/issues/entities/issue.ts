import { Id } from 'core'
import type { IssueSchema } from '../schemas/issue.schema.ts'
import { IssueStatusType } from '../value-objects/analysis-type.ts'
import type { IssueDto } from './issue.dto.ts'

export class Issue {
  private constructor(
    public readonly id: Id,
    public readonly title: string,
    public readonly description: string,
    public readonly reporterName: string,
    public readonly startAt: Date,
    public readonly waterZoneId: Id,
    public readonly status: IssueStatusType
  ) {}

  static create(issueSchema: Omit<IssueSchema, 'id'>) {
    return new Issue(
      Id.generateUniqueId(),
      issueSchema.title,
      issueSchema.description,
      issueSchema.reporterName,
      issueSchema.startAt,
      Id.create(issueSchema.waterZoneId),
      IssueStatusType.create(issueSchema.status)
    )
  }

  static fromDto(dto: IssueSchema): Issue {
    return new Issue(
      Id.create(dto.id),
      dto.title,
      dto.description,
      dto.reporterName,
      dto.startAt,
      Id.create(dto.waterZoneId),
      IssueStatusType.create(dto.status)
    )
  }

  toDto(): IssueDto {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId.toString(),
      title: this.title,
      reporterName: this.reporterName,
      description: this.description,
      status: this.status.toString(),
      startAt: this.startAt
    }
  }
}
