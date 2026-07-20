import type { FindableById, Id, Savable } from '@pda/common/domain'
import type { FeeConfig } from '../entities/fee-config'

export interface FeeConfigRepository extends FindableById<FeeConfig>, Savable<FeeConfig> {
  findById(id: Id): Promise<FeeConfig | undefined>
  findByCommunityId(communityId: Id): Promise<FeeConfig | undefined>
  save(feeConfig: FeeConfig): Promise<void>
}
