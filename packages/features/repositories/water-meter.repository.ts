import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { WaterMeter } from '../entities/water-meter'
import type { GetWaterMetersFiltersDto } from '../schemas/get-water-meters-filters.schema'

export interface WaterMeterRepository
  extends Savable<WaterMeter>,
    Deletable<WaterMeter>,
    FindableById<WaterMeter>,
    FindableAll<WaterMeter> {
  findWithFilters(filters: GetWaterMetersFiltersDto): Promise<WaterMeter[]>
}
