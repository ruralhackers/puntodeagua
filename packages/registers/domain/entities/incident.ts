import { Id } from '@pda/common/domain'
import {
  IncidentClosedWithoutEndDateError,
  IncidentEndDateBeforeStartDateError
} from '../errors/incident-errors'
import { IncidentStatusType } from '../value-objects/incident-status-type'
import type { IncidentDto, IncidentUpdateDto } from './incident.dto'
import { incidentSchema } from './incident.dto'

export class Incident {
  private constructor(
    public readonly id: Id,
    public readonly title: string,
    public readonly reporterName: string,
    public readonly startAt: Date,
    public status: IncidentStatusType,
    public readonly communityId: Id,
    public readonly communityZoneId?: Id,
    public readonly waterDepositId?: Id,
    public readonly waterPointId?: Id,
    public description?: string,
    public endAt?: Date
  ) {}

  static create(incidentData: Omit<IncidentDto, 'id'>) {
    // Validate using Zod schema (includes description length validation)
    const validatedData = incidentSchema.omit({ id: true }).parse(incidentData)

    // Add business logic validation
    if (validatedData.endAt && validatedData.endAt < validatedData.startAt) {
      throw new IncidentEndDateBeforeStartDateError()
    }

    if (validatedData.status === 'closed' && !validatedData.endAt) {
      throw new IncidentClosedWithoutEndDateError()
    }

    return new Incident(
      Id.generateUniqueId(),
      validatedData.title,
      validatedData.reporterName,
      validatedData.startAt,
      IncidentStatusType.fromString(validatedData.status),
      Id.fromString(validatedData.communityId),
      validatedData.communityZoneId ? Id.fromString(validatedData.communityZoneId) : undefined,
      validatedData.waterDepositId ? Id.fromString(validatedData.waterDepositId) : undefined,
      validatedData.waterPointId ? Id.fromString(validatedData.waterPointId) : undefined,
      validatedData.description,
      validatedData.endAt
    )
  }

  static fromDto(dto: IncidentDto): Incident {
    return new Incident(
      Id.fromString(dto.id),
      dto.title,
      dto.reporterName,
      dto.startAt,
      IncidentStatusType.fromString(dto.status),
      Id.fromString(dto.communityId),
      dto.communityZoneId ? Id.fromString(dto.communityZoneId) : undefined,
      dto.waterDepositId ? Id.fromString(dto.waterDepositId) : undefined,
      dto.waterPointId ? Id.fromString(dto.waterPointId) : undefined,
      dto.description,
      dto.endAt
    )
  }

  public update(incidentData: IncidentUpdateDto): Incident {
    this.status = IncidentStatusType.fromString(incidentData.status)
    this.endAt = incidentData.endAt
    this.description = incidentData.description
    return this
  }

  toDto(): IncidentDto {
    return {
      id: this.id.toString(),
      communityZoneId: this.communityZoneId?.toString(),
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
