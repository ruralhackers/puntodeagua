import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { Community } from '../entities/community'

export interface CommunityRepository
  extends Savable<Community>,
    FindableAll<Community>,
    Deletable<Community>,
    FindableForTable<Community> {
  findById(id: Id): Promise<Community | undefined>
}
