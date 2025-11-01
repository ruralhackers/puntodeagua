import type { Deletable, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterPoint } from '../entities/water-point'
import type { WaterPointWithAccountDto } from '../entities/water-point-with-account.dto'

export interface WaterPointRepository
  extends Savable<WaterPoint>,
    Deletable<WaterPoint>,
    FindableForTable<WaterPoint> {
  findById(id: Id): Promise<WaterPoint | undefined>
  findByCommunityZonesId(ids: Id[]): Promise<WaterPoint[]>
  findByCommunityZonesIdWithAccount(ids: Id[]): Promise<WaterPointWithAccountDto[]>
  findByCommunityIdWithAccount(id: Id): Promise<WaterPointWithAccountDto[]>
}
