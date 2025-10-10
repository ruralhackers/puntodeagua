import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterDeposit } from '../entities/water-deposit'

export interface WaterDepositRepository
  extends Savable<WaterDeposit>,
    FindableAll<WaterDeposit>,
    Deletable<WaterDeposit>,
    FindableForTable<WaterDeposit> {
  findById(id: Id): Promise<WaterDeposit | undefined>
  findByCommunityId(communityId: Id): Promise<WaterDeposit[]>
  findByIds(ids: Id[]): Promise<WaterDeposit[]>
}
