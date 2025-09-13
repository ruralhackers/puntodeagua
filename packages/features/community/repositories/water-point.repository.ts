import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { GetWaterPointsFiltersDto } from '../../schemas/get-water-points-filters.schema'
import type { WaterPoint } from '../entities/water-point'

export interface WaterPointRepository
  extends Savable<WaterPoint>,
    Deletable<WaterPoint>,
    FindableById<WaterPoint>,
    FindableAll<WaterPoint> {
  findWithFilters(filters: GetWaterPointsFiltersDto): Promise<WaterPoint[]>
}
