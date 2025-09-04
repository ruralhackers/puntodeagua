import type { Command } from 'core'
import type { WaterMeterReadingDto } from 'features'
import type { WaterMeterReadingApiRestRepository } from '../infrastructure/water-meter-reading.api-rest-repository'

export interface CreateWaterMeterReadingCommand {
  waterMeterId: string
  reading: string
  readingDate: Date
  notes?: string
  uploadedBy: string
}

export class CreateWaterMeterReadingCmd
  implements Command<CreateWaterMeterReadingCommand, WaterMeterReadingDto>
{
  static readonly ID = 'CreateWaterMeterReadingCmd'

  constructor(private readonly waterMeterReadingRepository: WaterMeterReadingApiRestRepository) {}

  async handle(command: CreateWaterMeterReadingCommand): Promise<WaterMeterReadingDto> {
    return await this.waterMeterReadingRepository.create(command)
  }
}
