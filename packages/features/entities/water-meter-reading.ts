import { Decimal } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { WaterMeterReadingSchema } from '../schemas/water-meter-reading.schema.ts'
import { File } from './file'
import type { WaterMeterReadingDto } from './water-meter-reading.dto.ts'

export class WaterMeterReading {
  private constructor(
    public readonly id: Id,
    public readonly waterMeterId: Id,
    public readonly reading: Decimal,
    public readonly normalizedReading: Decimal,
    public readonly readingDate: Date,
    public readonly notes?: string,
    public readonly files: File[] = [],
    public readonly consumption?: number,
    public readonly excessConsumption?: boolean
  ) {}

  static create({
    waterMeterId,
    reading,
    normalizedReading,
    readingDate,
    notes,
    files
  }: Omit<WaterMeterReadingSchema, 'id'>) {
    return new WaterMeterReading(
      Id.generateUniqueId(),
      Id.create(waterMeterId),
      Decimal.create(reading),
      Decimal.create(normalizedReading),
      readingDate,
      notes,
      files ? files.map((file) => File.create(file)) : []
    )
  }

  static fromDto(dto: WaterMeterReadingSchema): WaterMeterReading {
    return new WaterMeterReading(
      Id.create(dto.id),
      Id.create(dto.waterMeterId),
      Decimal.create(dto.reading),
      Decimal.create(dto.normalizedReading),
      dto.readingDate,
      dto.notes,
      dto.files ? dto.files.map((file) => File.create(file)) : [],
      dto.consumption,
      dto.excessConsumption
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
      files: this.files.map((file) => file.toDto()),
      consumption: this.consumption,
      excessConsumption: this.excessConsumption
    }
  }
}
