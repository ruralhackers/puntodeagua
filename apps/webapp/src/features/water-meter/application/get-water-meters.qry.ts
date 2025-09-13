import type { Query } from 'core'
import type { GetWaterMetersFiltersDto, WaterMeter, WaterMeterRepository } from 'features'

export class GetWaterMetersQry implements Query<WaterMeter[], GetWaterMetersFiltersDto> {
  static readonly ID = 'GetWaterMetersQry'

  constructor(private readonly waterMeterRepository: WaterMeterRepository) {}

  async handle(filters: GetWaterMetersFiltersDto = {}): Promise<WaterMeter[]> {
    const waterMeters = await this.waterMeterRepository.findWithFilters(filters)
    return waterMeters
  }
}
