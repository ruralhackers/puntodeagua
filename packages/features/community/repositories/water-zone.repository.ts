import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { GetWaterZonesFiltersDto } from '../../schemas/get-water-zones-filters.schema'
import type { WaterZone } from '../entities/water-zone'

export interface WaterZoneRepository
  extends Savable<WaterZone>,
    Deletable<WaterZone>,
    FindableById<WaterZone>,
    FindableAll<WaterZone> {
  findWithFilters(filters: GetWaterZonesFiltersDto): Promise<WaterZone[]>
}
