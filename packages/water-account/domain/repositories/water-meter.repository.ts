import type { Deletable, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterMeter } from '../entities/water-meter'

export interface WaterMeterRepository
  extends Savable<WaterMeter>,
    Deletable<WaterMeter>,
    FindableForTable<WaterMeter> {
  findById(id: Id): Promise<WaterMeter | undefined>
  findByWaterPointId(id: Id): Promise<WaterMeter[]>
  findActiveByCommunityZonesIdOrderedByLastReading(zonesIds: Id[]): Promise<WaterMeter[]>
}
