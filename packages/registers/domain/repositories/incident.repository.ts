import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { Incident } from '../entities/incident'

export interface IncidentRepository
  extends Savable<Incident>,
    FindableAll<Incident>,
    Deletable<Incident>,
    FindableForTable<Incident> {
  findById(id: Id): Promise<Incident | undefined>
  findByCommunityId(communityId: Id): Promise<Incident[]>
}
