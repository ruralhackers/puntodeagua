import type { Query } from 'core'
import type { GetWaterMetersFiltersDto, WaterMeterRepository } from 'features'
import type { WaterMeter } from 'features/entities/water-meter'

export class GetWaterMetersQry implements Query<WaterMeter[], GetWaterMetersFiltersDto> {
  static readonly ID = 'GetWaterMetersQry'

  constructor(private readonly waterMeterRepository: WaterMeterRepository) {}

  async handle(filters: GetWaterMetersFiltersDto = {}): Promise<WaterMeter[]> {
    return this.waterMeterRepository.findWithFilters(filters)
  }
}
