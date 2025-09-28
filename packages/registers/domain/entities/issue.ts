import { Id } from '@pda/common/domain'
import { IssueStatusType } from '../value-objects/issue-status-type'
import type { IssueDto } from './issue.dto'
import { issueSchema } from './issue.dto'

export class Issue {
  private constructor(
    public readonly id: Id,
    public readonly title: string,
    public readonly reporterName: string,
    public readonly startAt: Date,
    public readonly status: IssueStatusType,
    public readonly communityId: Id,
    public readonly waterZoneId?: Id,
    public readonly waterDepositId?: Id,
    public readonly waterPointId?: Id,
    public readonly description?: string,
    public readonly endAt?: Date
  ) {}

  static create(issueData: Omit<IssueDto, 'id'>) {
    // Validate using Zod schema (includes description length validation)
    const validatedData = issueSchema.omit({ id: true }).parse(issueData)

    // Add business logic validation
    if (validatedData.endAt && validatedData.endAt < validatedData.startAt) {
      throw new Error('End date cannot be before start date')
    }

    if (validatedData.status === 'closed' && !validatedData.endAt) {
      throw new Error('Closed issues must have an end date')
    }

    return new Issue(
      Id.generateUniqueId(),
      validatedData.title,
      validatedData.reporterName,
      validatedData.startAt,
      IssueStatusType.fromString(validatedData.status),
      Id.fromString(validatedData.communityId),
      validatedData.waterZoneId ? Id.fromString(validatedData.waterZoneId) : undefined,
      validatedData.waterDepositId ? Id.fromString(validatedData.waterDepositId) : undefined,
      validatedData.waterPointId ? Id.fromString(validatedData.waterPointId) : undefined,
      validatedData.description,
      validatedData.endAt
    )
  }

  static fromDto(dto: IssueDto): Issue {
    return new Issue(
      Id.fromString(dto.id),
      dto.title,
      dto.reporterName,
      dto.startAt,
      IssueStatusType.fromString(dto.status),
      Id.fromString(dto.communityId),
      dto.waterZoneId ? Id.fromString(dto.waterZoneId) : undefined,
      dto.waterDepositId ? Id.fromString(dto.waterDepositId) : undefined,
      dto.waterPointId ? Id.fromString(dto.waterPointId) : undefined,
      dto.description,
      dto.endAt
    )
  }

  toDto(): IssueDto {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId?.toString(),
      waterDepositId: this.waterDepositId?.toString(),
      communityId: this.communityId.toString(),
      title: this.title,
      reporterName: this.reporterName,
      waterPointId: this.waterPointId?.toString(),
      description: this.description,
      status: this.status.toString() as 'open' | 'closed',
      startAt: this.startAt,
      endAt: this.endAt ? this.endAt : undefined
    }
  }
}
