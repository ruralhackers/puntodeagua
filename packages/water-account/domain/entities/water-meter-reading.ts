import { Decimal, Id } from '@pda/common/domain'
import type { MeasurementUnit } from '../value-objects/measurement-unit'
import type { WaterMeterReadingDto, WaterMeterReadingUpdateDto } from './water-meter-reading.dto'
import type { WaterMeterReadingImageDto } from './water-meter-reading-image.dto'

export class WaterMeterReading {
  private constructor(
    public readonly id: Id,
    public waterMeterId: Id,
    public reading: Decimal,
    public normalizedReading: number, // this is the reading in Liters
    public readingDate: Date,
    public notes?: string | null,
    public waterMeterReadingImage?: WaterMeterReadingImageDto | null
  ) {}

  static create(dto: Omit<WaterMeterReadingDto, 'id'>) {
    return new WaterMeterReading(
      Id.generateUniqueId(),
      Id.fromString(dto.waterMeterId),
      Decimal.fromString(dto.reading),
      dto.normalizedReading,
      dto.readingDate,
      dto.notes ?? null,
      dto.waterMeterReadingImage ?? null
    )
  }

  static fromDto(dto: WaterMeterReadingDto) {
    return new WaterMeterReading(
      Id.fromString(dto.id),
      Id.fromString(dto.waterMeterId),
      Decimal.fromString(dto.reading),
      dto.normalizedReading,
      dto.readingDate,
      dto.notes ?? null,
      dto.waterMeterReadingImage ?? null
    )
  }

  update(data: WaterMeterReadingUpdateDto, measurementUnit: MeasurementUnit): WaterMeterReading {
    if (data.reading !== undefined) {
      this.reading = Decimal.fromString(data.reading)
      this.normalizedReading = measurementUnit.normalize(this.reading)
    }
    if (data.notes !== undefined) {
      this.notes = data.notes
    }
    return this
  }

  toDto(): WaterMeterReadingDto {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      reading: this.reading.toString(),
      normalizedReading: this.normalizedReading,
      readingDate: this.readingDate,
      notes: this.notes ?? null,
      waterMeterReadingImage: this.waterMeterReadingImage ?? null
    }
  }
}
