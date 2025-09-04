import { MeasurementUnit } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { WaterMeterSchema } from '../schemas/water-meter.schema.ts'

export class WaterMeter {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly holderId: Id,
    public readonly waterPointId: Id,
    public readonly waterZoneId: Id,
    public measurementUnit: MeasurementUnit,
    public images: string[] | [],
    public readonly waterZoneName?: string,
    public readonly lastReadingValue?: string,
    public readonly lastReadingDate?: Date
  ) {}

  static create({
    id,
    name,
    holderId,
    waterPointId,
    waterZoneId,
    measurementUnit,
    images,
    waterZoneName,
    lastReadingValue,
    lastReadingDate
  }: WaterMeterSchema) {
    return new WaterMeter(
      Id.create(id),
      name,
      Id.create(holderId),
      Id.create(waterPointId),
      Id.create(waterZoneId),
      MeasurementUnit.create(measurementUnit),
      images || [],
      waterZoneName,
      lastReadingValue,
      lastReadingDate
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
      holderId: this.holderId.toString(),
      waterPointId: this.waterPointId.toString(),
      waterZoneId: this.waterZoneId.toString(),
      waterZoneName: this.waterZoneName,
      measurementUnit: this.measurementUnit.toString(),
      images: this.images,
      lastReadingValue: this.lastReadingValue,
      lastReadingDate: this.lastReadingDate
    }
  }
}
