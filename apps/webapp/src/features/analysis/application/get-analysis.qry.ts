import type { Id, Query } from 'core'
import type { Analysis, AnalysisRepository } from 'features'

export class GetAnalysisQry implements Query<Analysis | undefined, { id: Id }> {
  static readonly ID = 'GetAnalysesQry'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle({ id }: { id: Id }): Promise<Analysis | undefined> {
    const entity = await this.analysisRepository.findById(id)
    return entity
  }
}
