import { type Command, Id, MeasurementUnit } from 'core'
import type { WaterMeterRepository } from 'features'

export interface UpdateWaterMeterCommand {
  id: string
  name: string
  measurementUnit: string
  waterZoneId?: string
  images?: string[]
}

export class UpdateWaterMeterCmd implements Command<UpdateWaterMeterCommand> {
  static readonly ID = 'UpdateWaterMeterCmd'

  constructor(private readonly repo: WaterMeterRepository) {}

  async handle(command: UpdateWaterMeterCommand): Promise<void> {
    // First, get the existing water meter to preserve non-editable fields
    const existingWaterMeter = await this.repo.findById(Id.create(command.id))

    if (!existingWaterMeter) {
      throw new Error(`Water meter with id ${command.id} not found`)
    }

    existingWaterMeter.name = command.name
    existingWaterMeter.measurementUnit = command.measurementUnit
      ? MeasurementUnit.create(command.measurementUnit)
      : existingWaterMeter.measurementUnit
    existingWaterMeter.images = command.images || existingWaterMeter.images

    return this.repo.save(existingWaterMeter)
  }
}
