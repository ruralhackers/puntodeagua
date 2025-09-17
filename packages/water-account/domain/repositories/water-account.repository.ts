import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterAccount } from '../entities/water-account'

export interface WaterAccountRepository
  extends Savable<WaterAccount>,
    FindableAll<WaterAccount>,
    Deletable<WaterAccount>,
    FindableForTable<WaterAccount> {
  findById(id: Id): Promise<WaterAccount | undefined>
}
