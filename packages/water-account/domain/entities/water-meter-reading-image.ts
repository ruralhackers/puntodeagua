import { Id } from '@pda/common/domain'
import type { WaterMeterReadingImageDto } from './water-meter-reading-image.dto'

export class WaterMeterReadingImage {
  private constructor(
    public readonly id: Id,
    public readonly waterMeterReadingId: Id,
    public readonly url: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly uploadedAt: Date,
    public readonly externalKey: string
  ) {}

  static fromDto(dto: WaterMeterReadingImageDto): WaterMeterReadingImage {
    return new WaterMeterReadingImage(
      Id.fromString(dto.id),
      Id.fromString(dto.waterMeterReadingId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      dto.uploadedAt,
      dto.externalKey
    )
  }

  static create(dto: Omit<WaterMeterReadingImageDto, 'id'>): WaterMeterReadingImage {
    return new WaterMeterReadingImage(
      Id.generateUniqueId(),
      Id.fromString(dto.waterMeterReadingId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      dto.uploadedAt,
      dto.externalKey
    )
  }

  toDto(): WaterMeterReadingImageDto {
    return {
      id: this.id.toString(),
      waterMeterReadingId: this.waterMeterReadingId.toString(),
      url: this.url,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      uploadedAt: this.uploadedAt,
      externalKey: this.externalKey
    }
  }
}

