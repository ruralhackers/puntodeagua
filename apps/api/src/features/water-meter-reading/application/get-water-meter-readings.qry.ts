import type { Query } from 'core'
import type { WaterMeterReadingRepository } from 'features'
import type { WaterMeterReading } from 'features/entities/water-meter-reading'

export class GetWaterMeterReadingsQry implements Query<WaterMeterReading[]> {
  static readonly ID = 'GetWaterMeterReadingsQry'

  constructor(private readonly waterMeterReadingRepository: WaterMeterReadingRepository) {}

  async handle(): Promise<WaterMeterReading[]> {
    const readings = await this.waterMeterReadingRepository.findAll()
    return readings
  }
}
