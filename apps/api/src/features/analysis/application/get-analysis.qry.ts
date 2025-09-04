import type { Id, Query } from 'core'
import type { Analysis, AnalysisRepository } from 'features'

export class GetAnalysisQry implements Query<Analysis | undefined, Id> {
  static readonly ID = 'GetAnalysisQry'
  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(id: Id): Promise<Analysis | undefined> {
    return this.analysisRepository.findById(id)
  }
}
