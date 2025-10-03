import { Id } from '@pda/common/domain'
import { MeasurementUnit } from '../value-objects/measurement-unit'
import type { WaterMeterDto } from './water-meter.dto'

export class WaterMeter {
  private constructor(
    public readonly id: Id,
    public name: string,
    public waterAccountId: Id,
    public waterPointId: Id,
    public measurementUnit: MeasurementUnit,
    public lastReadingNormalizedValue?: number | null,
    public lastReadingDate?: Date | null,
    public lastReadingExcessConsumption?: boolean | null,
    public isActive: boolean = true
  ) {}

  static create(dto: Omit<WaterMeterDto, 'id'>) {
    return new WaterMeter(
      Id.generateUniqueId(),
      dto.name,
      Id.fromString(dto.waterAccountId),
      Id.fromString(dto.waterPointId),
      MeasurementUnit.fromString(dto.measurementUnit),
      dto.lastReadingNormalizedValue,
      dto.lastReadingDate,
      dto.lastReadingExcessConsumption,
      dto.isActive
    )
  }

  static fromDto(dto: WaterMeterDto) {
    return new WaterMeter(
      Id.fromString(dto.id),
      dto.name,
      Id.fromString(dto.waterAccountId),
      Id.fromString(dto.waterPointId),
      MeasurementUnit.fromString(dto.measurementUnit),
      dto.lastReadingNormalizedValue,
      dto.lastReadingDate,
      dto.lastReadingExcessConsumption,
      dto.isActive
    )
  }

  toDto(): WaterMeterDto {
    return {
      id: this.id.toString(),
      name: this.name,
      waterAccountId: this.waterAccountId.toString(),
      waterPointId: this.waterPointId.toString(),
      measurementUnit: this.measurementUnit.toString(),
      lastReadingNormalizedValue: this.lastReadingNormalizedValue ?? null,
      lastReadingDate: this.lastReadingDate ?? null,
      lastReadingExcessConsumption: this.lastReadingExcessConsumption ?? null,
      isActive: this.isActive
    }
  }

  updateLastReading(params: {
    normalizedReading: number
    readingDate: Date
    excessConsumption: boolean
  }) {
    this.lastReadingNormalizedValue = params.normalizedReading
    this.lastReadingDate = params.readingDate
    this.lastReadingExcessConsumption = params.excessConsumption
  }
}
