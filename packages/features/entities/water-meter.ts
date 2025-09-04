import { MeasurementUnit } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { WaterMeterSchema } from '../schemas/water-meter.schema.ts'

export class WaterMeter {
  private constructor(
    public readonly id: Id,
    public readonly holderId: Id,
    public readonly waterPointId: Id,
    public measurementUnit: MeasurementUnit,
    public images: string[] | []
  ) {}

  static create({ id, holderId, waterPointId, measurementUnit, images }: WaterMeterSchema) {
    return new WaterMeter(
      Id.create(id),
      Id.create(holderId),
      Id.create(waterPointId),
      MeasurementUnit.create(measurementUnit),
      images || []
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      holderId: this.holderId.toString(),
      waterPointId: this.waterPointId.toString(),
      measurementUnit: this.measurementUnit.toString(),
      images: this.images
    }
  }
}
