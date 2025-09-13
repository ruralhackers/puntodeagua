import type { Deletable, FindableAll, FindableById, Id, Savable } from 'core'
import type { WaterMeter } from '../entities/water-meter'
import type { GetWaterMetersFiltersDto } from '../entities/water-meter.dto'

export interface WaterMeterRepository
  extends Savable<WaterMeter>,
    Deletable<WaterMeter>,
    FindableById<WaterMeter>,
    FindableAll<WaterMeter> {
  findWithFilters(filters: GetWaterMetersFiltersDto): Promise<WaterMeter[]>
  findById(id: Id, communityId?: string): Promise<WaterMeter | undefined>
}
