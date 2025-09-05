import type { Query } from 'core'
import type { WaterZone, WaterZoneRepository } from 'features'
import type { GetWaterZonesFiltersDto } from 'features/schemas/get-water-zones-filters.schema'

export class GetWaterZonesQry implements Query<WaterZone[], GetWaterZonesFiltersDto> {
  static readonly ID = 'GetWaterZonesQry'
  constructor(private readonly repo: WaterZoneRepository) {}

  async handle(filters: GetWaterZonesFiltersDto = {}): Promise<WaterZone[]> {
    return this.repo.findWithFilters(filters)
  }
}
