import { Id } from '@pda/common/domain'
import type { WaterMeterImageDto } from './water-meter-image.dto'

export class WaterMeterImage {
  private constructor(
    public readonly id: Id,
    public readonly waterMeterId: Id,
    public readonly url: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly uploadedAt: Date,
    public readonly externalKey: string
  ) {}

  static create(dto: Omit<WaterMeterImageDto, 'id' | 'uploadedAt'>) {
    return new WaterMeterImage(
      Id.generateUniqueId(),
      Id.fromString(dto.waterMeterId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      new Date(),
      dto.externalKey
    )
  }

  static fromDto(dto: WaterMeterImageDto) {
    return new WaterMeterImage(
      Id.fromString(dto.id),
      Id.fromString(dto.waterMeterId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      dto.uploadedAt,
      dto.externalKey
    )
  }

  toDto(): WaterMeterImageDto {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      url: this.url,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      uploadedAt: this.uploadedAt,
      externalKey: this.externalKey
    }
  }
}
