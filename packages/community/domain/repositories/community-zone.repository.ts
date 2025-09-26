import type { Deletable, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { CommunityZone } from '../entities/community-zone'

export interface CommunityZoneRepository
  extends Savable<CommunityZone>,
    Deletable<CommunityZone>,
    FindableForTable<CommunityZone> {
  findByCommunityId(id: Id): Promise<CommunityZone[]>
}
