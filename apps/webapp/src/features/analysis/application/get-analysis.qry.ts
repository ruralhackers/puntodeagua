import { Id, type Query } from 'core'
import type { Analysis, AnalysisRepository } from 'features'

export class GetAnalysisQry implements Query<Analysis | undefined, { id: string }> {
  static readonly ID = 'GetAnalysesQry'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle({ id }: { id: string }): Promise<Analysis | undefined> {
    console.log('GetAnalysisQry', id)
    const entity = await this.analysisRepository.findById(Id.create(id))
    return entity
  }
}
