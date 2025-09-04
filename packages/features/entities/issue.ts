import { Id } from 'core'
import type { IssueSchema } from '../schemas/issue.schema.ts'
import type { IssueDto } from './issue.dto.ts'

export class Issue {
  private constructor(
    public readonly id: Id,
    public readonly title: string,
    public readonly waterZoneId: Id
  ) {}

  static create(issueSchema: Omit<IssueSchema, 'id'>) {
    return new Issue(Id.generateUniqueId(), issueSchema.title, Id.create(issueSchema.waterZoneId))
  }

  static fromDto(dto: IssueSchema): Issue {
    return new Issue(Id.create(dto.id), dto.title, Id.create(dto.waterZoneId))
  }

  toDto(): IssueDto {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId.toString(),
      title: this.title
    }
  }
}
