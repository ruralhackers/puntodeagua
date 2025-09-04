import type { Command } from 'core'
import type { WaterMeterReadingApiRestRepository } from '../infrastructure/water-meter-reading.api-rest-repository'

export interface DeleteWaterMeterReadingCommand {
  id: string
}

export class DeleteWaterMeterReadingCmd implements Command<DeleteWaterMeterReadingCommand, void> {
  static readonly ID = 'DeleteWaterMeterReadingCmd'

  constructor(private readonly waterMeterReadingRepository: WaterMeterReadingApiRestRepository) {}

  async handle(command: DeleteWaterMeterReadingCommand): Promise<void> {
    const { Id } = await import('core')
    const id = Id.create(command.id)
    return await this.waterMeterReadingRepository.delete(id)
  }
}
