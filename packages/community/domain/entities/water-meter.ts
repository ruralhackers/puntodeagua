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
    public lastReadingNormalizedValue?: number,
    public lastReadingDate?: Date,
    public lastReadingExcessConsumption?: boolean
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
      dto.lastReadingExcessConsumption
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
      dto.lastReadingExcessConsumption
    )
  }

  toDto(): WaterMeterDto {
    return {
      id: this.id.toString(),
      name: this.name,
      waterAccountId: this.waterAccountId.toString(),
      waterPointId: this.waterPointId.toString(),
      measurementUnit: this.measurementUnit.toString(),
      lastReadingNormalizedValue: this.lastReadingNormalizedValue,
      lastReadingDate: this.lastReadingDate,
      lastReadingExcessConsumption: this.lastReadingExcessConsumption
    }
  }
}
