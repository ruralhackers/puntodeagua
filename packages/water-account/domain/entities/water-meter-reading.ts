import { Decimal, Id } from '@pda/common/domain'
import type { WaterMeterReadingDto } from './water-meter-reading.dto'

export class WaterMeterReading {
  private constructor(
    public readonly id: Id,
    public waterMeterId: Id,
    public reading: Decimal,
    public normalizedReading: number, // this is the reading in Liters
    public readingDate: Date,
    public notes?: string | null
  ) {}

  static create(dto: Omit<WaterMeterReadingDto, 'id'>) {
    return new WaterMeterReading(
      Id.generateUniqueId(),
      Id.fromString(dto.waterMeterId),
      Decimal.fromString(dto.reading),
      dto.normalizedReading,
      dto.readingDate,
      dto.notes ?? null
    )
  }

  static fromDto(dto: WaterMeterReadingDto) {
    return new WaterMeterReading(
      Id.fromString(dto.id),
      Id.fromString(dto.waterMeterId),
      Decimal.fromString(dto.reading),
      dto.normalizedReading,
      dto.readingDate,
      dto.notes ?? null
    )
  }

  toDto(): WaterMeterReadingDto {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      reading: this.reading.toString(),
      normalizedReading: this.normalizedReading,
      readingDate: this.readingDate,
      notes: this.notes ?? null
    }
  }
}
