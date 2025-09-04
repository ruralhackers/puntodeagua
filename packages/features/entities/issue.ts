import { Id } from 'core'
import type { IssueSchema } from '../schemas/issue.schema.ts'
import type { IssueDto } from './issue.dto.ts'

export class Issue {
  private constructor(
    public readonly id: Id,
    public readonly title: string,
    public readonly description: string,
    public readonly reporterName: string,
    public readonly startAt: Date,
    public readonly waterZoneId: Id
  ) {}

  static create(issueSchema: Omit<IssueSchema, 'id'>) {
    const id1 = Id.generateUniqueId()
    console.log(id1)
    return new Issue(
      id1,
      issueSchema.title,
      issueSchema.description,
      issueSchema.reporterName,
      issueSchema.startAt,
      Id.create(issueSchema.waterZoneId)
    )
  }

  static fromDto(dto: IssueSchema): Issue {
    return new Issue(
      Id.create(dto.id),
      dto.title,
      dto.description,
      dto.reporterName,
      dto.startAt,
      Id.create(dto.waterZoneId)
    )
  }

  toDto(): IssueDto {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId.toString(),
      title: this.title,
      reporterName: this.reporterName,
      description: this.description,
      startAt: this.startAt
    }
  }
}
