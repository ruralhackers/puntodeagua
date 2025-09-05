import { type Command, Id } from 'core'
import { WaterMeter, type WaterMeterRepository, type WaterZoneRepository } from 'features'

export interface UpdateWaterMeterCommand {
  id: string
  name: string
  measurementUnit: string
  waterZoneId?: string
  images?: string[]
}

export class UpdateWaterMeterCmd implements Command<UpdateWaterMeterCommand> {
  static readonly ID = 'UpdateWaterMeterCmd'

  constructor(
    private readonly repo: WaterMeterRepository,
    private readonly waterZoneRepo: WaterZoneRepository
  ) {}

  async handle(command: UpdateWaterMeterCommand): Promise<void> {
    // First, get the existing water meter to preserve non-editable fields
    const existingWaterMeter = await this.repo.findById(Id.create(command.id))

    if (!existingWaterMeter) {
      throw new Error(`Water meter with id ${command.id} not found`)
    }

    // Create updated water meter with new values and preserved existing values
    const updatedWaterMeter = WaterMeter.create({
      id: command.id,
      name: command.name,
      holderId: existingWaterMeter.holderId.toString(),
      waterPointId: existingWaterMeter.waterPointId.toString(),
      waterZoneId: command.waterZoneId || existingWaterMeter.waterZoneId.toString(),
      measurementUnit: command.measurementUnit,
      images: command.images || existingWaterMeter.images,
      lastReadingValue: existingWaterMeter.lastReadingValue,
      lastReadingDate: existingWaterMeter.lastReadingDate,
      readings: existingWaterMeter.readings
    })

    return this.repo.save(updatedWaterMeter)
  }
}
