import { Id } from '@pda/common/domain'
import type { IncidentImageDto } from './incident-image.dto'

export class IncidentImage {
  private constructor(
    public readonly id: Id,
    public readonly incidentId: Id,
    public readonly url: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly uploadedAt: Date,
    public readonly externalKey: string
  ) {}

  static create(dto: Omit<IncidentImageDto, 'id' | 'uploadedAt'>): IncidentImage {
    return new IncidentImage(
      Id.generateUniqueId(),
      Id.fromString(dto.incidentId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      new Date(),
      dto.externalKey
    )
  }

  static fromDto(dto: IncidentImageDto): IncidentImage {
    return new IncidentImage(
      Id.fromString(dto.id),
      Id.fromString(dto.incidentId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      dto.uploadedAt,
      dto.externalKey
    )
  }

  toDto(): IncidentImageDto {
    return {
      id: this.id.toString(),
      incidentId: this.incidentId.toString(),
      url: this.url,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      uploadedAt: this.uploadedAt,
      externalKey: this.externalKey
    }
  }
}
