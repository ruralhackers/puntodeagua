import type { Command } from 'core'
import { Id } from 'core'
import type { WaterMeterReadingRepository } from 'features'

export interface DeleteWaterMeterReadingCommand {
  id: string
}

export class DeleteWaterMeterReadingCmd implements Command<DeleteWaterMeterReadingCommand, void> {
  static readonly ID = Symbol('DeleteWaterMeterReadingCmd')

  constructor(private readonly waterMeterReadingRepository: WaterMeterReadingRepository) {}

  async handle(command: DeleteWaterMeterReadingCommand): Promise<void> {
    const id = Id.create(command.id)

    const reading = await this.waterMeterReadingRepository.findById(id)
    if (!reading) {
      throw new Error(`Water meter reading with id ${command.id} not found`)
    }

    await this.waterMeterReadingRepository.delete(id)
  }
}
