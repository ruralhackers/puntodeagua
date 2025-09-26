import type { Deletable, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterPoint } from '../entities/water-point'

export interface WaterPointRepository
  extends Savable<WaterPoint>,
    Deletable<WaterPoint>,
    FindableForTable<WaterPoint> {
  findById(id: Id): Promise<WaterPoint | undefined>
  findByCommunityZonesId(ids: Id[]): Promise<WaterPoint[]>
}
