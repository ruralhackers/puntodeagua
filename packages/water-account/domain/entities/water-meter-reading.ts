import { Id } from '@pda/common/domain'
import type { WaterMeterReadingDto } from './water-meter-reading.dto'

export class WaterMeterReading {
  private constructor(
    public readonly id: Id,
    public waterMeterId: Id,
    public reading: number,
    public normalizedReading: number, // this is the reading in Liters
    public readingDate: Date,
    public notes?: string
  ) {}

  static create(dto: Omit<WaterMeterReadingDto, 'id'>) {
    return new WaterMeterReading(
      Id.generateUniqueId(),
      Id.fromString(dto.waterMeterId),
      dto.reading,
      dto.normalizedReading,
      dto.readingDate,
      dto.notes
    )
  }

  static fromDto(dto: WaterMeterReadingDto) {
    return new WaterMeterReading(
      Id.fromString(dto.id),
      Id.fromString(dto.waterMeterId),
      dto.reading,
      dto.normalizedReading,
      dto.readingDate,
      dto.notes
    )
  }

  toDto(): WaterMeterReadingDto {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      reading: this.reading,
      normalizedReading: this.normalizedReading,
      readingDate: this.readingDate,
      notes: this.notes
    }
  }
}
