import type { Deletable, FindableAll, FindableById, Id, Savable } from 'core'
import type { Analysis } from '../entities/analysis'

export interface AnalysisRepository
  extends Savable<Analysis>,
    Deletable<Analysis>,
    FindableById<Analysis>,
    FindableAll<Analysis> {
  findAllOrderedByAnalyzedAt(communityId: Id): Promise<Analysis[]>
}
