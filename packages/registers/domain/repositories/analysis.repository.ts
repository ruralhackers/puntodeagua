import type { Deletable, FindableAll, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { Analysis } from '../entities/analysis'

export interface AnalysisRepository
  extends Savable<Analysis>,
    FindableAll<Analysis>,
    Deletable<Analysis>,
    FindableForTable<Analysis> {
  findById(id: Id): Promise<Analysis | undefined>
  findByCommunityId(communityId: Id): Promise<Analysis[]>
  findByFilters(filters: {
    communityId?: Id
    analysisTypes?: string[]
    startDate?: Date
    endDate?: Date
  }): Promise<
    Array<{
      id: string
      analysisType: string
      analyst: string
      analyzedAt: Date
      communityName: string
      zoneName?: string
      depositName?: string
      ph?: number
      chlorine?: number
      turbidity?: number
      description?: string
    }>
  >
}
