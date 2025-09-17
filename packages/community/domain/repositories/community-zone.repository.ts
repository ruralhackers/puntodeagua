import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { CommunityZone } from '../entities/community-zone'

export interface CommunityZoneRepository
  extends Savable<CommunityZone>,
    FindableAll<CommunityZone>,
    Deletable<CommunityZone>,
    FindableForTable<CommunityZone> {
  findById(id: Id): Promise<CommunityZone | undefined>
}
