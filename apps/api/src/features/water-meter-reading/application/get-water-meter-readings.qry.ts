import type { Query } from 'core'
import { WaterMeterReading, WaterMeterReadingDto } from 'features'

export class GetWaterMeterReadingsQry implements Query<WaterMeterReadingDto[], void> {
  static readonly ID = 'GetWaterMeterReadingsQry'

  constructor(private readonly waterMeterReadingRepository: any) {}

  async handle(): Promise<WaterMeterReadingDto[]> {
    // Get all water meter readings from repository
    const waterMeterReadings = await this.waterMeterReadingRepository.findAll()

    // Convert to DTOs
    return waterMeterReadings.map((reading: WaterMeterReading) => reading.toDto())
  }
}
