import type {
  Deletable,
  FindableByCommunityId,
  FindableForTable,
  Id,
  Savable
} from '@pda/common/domain'
import type { CommunityZone } from '../entities/community-zone'

export interface CommunityZoneRepository
  extends Savable<CommunityZone>,
    Deletable<CommunityZone>,
    FindableByCommunityId<CommunityZone>,
    FindableForTable<CommunityZone> {
  findById(id: Id): Promise<CommunityZone | undefined>
}
