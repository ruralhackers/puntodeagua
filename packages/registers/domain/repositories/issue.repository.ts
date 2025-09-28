import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { Issue } from '../entities/issue'

export interface IssueRepository
  extends Savable<Issue>,
    FindableAll<Issue>,
    Deletable<Issue>,
    FindableForTable<Issue> {
  findById(id: Id): Promise<Issue | undefined>
  findByCommunityId(communityId: Id): Promise<Issue[]>
}
