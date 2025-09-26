import type { Id } from '../value-objects/id'

export interface FindableByCommunityId<In> {
  findByCommunityId(input: Id): Promise<In[]>
}
