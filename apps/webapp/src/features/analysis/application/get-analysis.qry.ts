import { Id, type Query } from 'core'
import type { Analysis, AnalysisRepository } from 'features'

export class GetAnalysisQry implements Query<Analysis | undefined, { id: string }> {
  static readonly ID = 'GetAnalysisQry'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle({ id }: { id: string }): Promise<Analysis | undefined> {
    const entity = await this.analysisRepository.findById(Id.create(id))
    return entity
  }
}
