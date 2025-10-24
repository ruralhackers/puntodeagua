import type { Deletable, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterMeter } from '../entities/water-meter'
import type { WaterMeterDisplayDto } from '../entities/water-meter-display.dto'

export interface WaterMeterRepository
  extends Savable<WaterMeter>,
    Deletable<WaterMeter>,
    FindableForTable<WaterMeter> {
  findById(id: Id): Promise<WaterMeter | undefined>
  findByIdForDisplay(id: Id): Promise<WaterMeterDisplayDto | undefined>
  findByWaterPointId(id: Id): Promise<WaterMeter[]>
  findByWaterPointIdForDisplay(id: Id): Promise<WaterMeterDisplayDto[]>
  findActiveByCommunityZonesIdOrderedByLastReading(zonesIds: Id[]): Promise<WaterMeterDisplayDto[]>
}
