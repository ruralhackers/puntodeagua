import { DateTime, Id } from 'core'
import type { IssueSchema } from '../schemas/issue.schema.ts'
import { IssueStatusType } from '../value-objects/issue-status-type.ts'

export class Issue {
  private constructor(
    public readonly id: Id,
    public readonly title: string,
    public readonly reporterName: string,
    public readonly startAt: DateTime,
    public readonly waterZoneId: Id,
    public readonly status: IssueStatusType,
    public readonly description?: string,
    public readonly endAt?: DateTime
  ) {}

  static create(issueSchema: Omit<IssueSchema, 'id'>) {
    return new Issue(
      Id.generateUniqueId(),
      issueSchema.title,
      issueSchema.reporterName,
      DateTime.fromISO(issueSchema.startAt),
      Id.create(issueSchema.waterZoneId),
      IssueStatusType.create(issueSchema.status),
      issueSchema.description,
      issueSchema.endAt ? DateTime.fromISO(issueSchema.endAt) : undefined
    )
  }

  static fromDto(dto: IssueSchema): Issue {
    return new Issue(
      Id.create(dto.id),
      dto.title,
      dto.reporterName,
      DateTime.fromISO(dto.startAt),
      Id.create(dto.waterZoneId),
      IssueStatusType.create(dto.status),
      dto.description,
      dto.endAt ? DateTime.fromISO(dto.endAt) : undefined
    )
  }

  toDto(): IssueSchema {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId.toString(),
      title: this.title,
      reporterName: this.reporterName,
      description: this.description,
      status: this.status.toString(),
      startAt: this.startAt.toISO(),
      endAt: this.endAt ? this.endAt.toISO() : undefined
    }
  }
}
