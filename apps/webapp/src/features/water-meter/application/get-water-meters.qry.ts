import type { Query } from 'core'
import type { WaterMeterRepository } from 'features'
import type { WaterMeter } from 'features/entities/water-meter'

export class GetWaterMetersQry implements Query<WaterMeter[]> {
  static readonly ID = 'GetWaterMetersQry'

  constructor(private readonly waterMeterRepository: WaterMeterRepository) {}

  async handle(): Promise<WaterMeter[]> {
    const waterMeters = await this.waterMeterRepository.findAll()
    return waterMeters
  }
}
