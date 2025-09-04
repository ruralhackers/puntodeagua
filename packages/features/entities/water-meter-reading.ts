import { Decimal } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { WaterMeterReadingSchema } from '../schemas/water-meter-reading.schema.ts'
import type { File } from './file'
import type { WaterMeterReadingDto } from './water-meter-reading.dto.ts'

export class WaterMeterReading {
  private constructor(
    public readonly id: Id,
    public readonly waterMeterId: Id,
    public readonly reading: Decimal,
    public readonly normalizedReading: Decimal,
    public readonly readingDate: Date,
    public readonly notes?: string,
    public readonly files: File[] = []
  ) {}

  static create({
    id,
    waterMeterId,
    reading,
    normalizedReading,
    readingDate,
    notes,
    files
  }: WaterMeterReadingSchema) {
    return new WaterMeterReading(
      Id.create(id),
      Id.create(waterMeterId),
      Decimal.create(reading),
      Decimal.create(normalizedReading),
      readingDate,
      notes,
      files || []
    )
  }

  toDto(): WaterMeterReadingDto {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      reading: this.reading.toString(),
      normalizedReading: this.normalizedReading.toString(),
      readingDate: this.readingDate,
      notes: this.notes,
      files: this.files.map((file) => file.toDto())
    }
  }
}
