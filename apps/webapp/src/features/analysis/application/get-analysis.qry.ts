import { Id, type Query } from 'core'
import type { IdSchema } from 'core/types/id.schema'
import type { Analysis, AnalysisRepository } from 'features'

export class GetAnalysisQry implements Query<Analysis | undefined, IdSchema> {
  static readonly ID = 'GetAnalysisQry'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(id: IdSchema): Promise<Analysis | undefined> {
    const entity = await this.analysisRepository.findById(Id.create(id))
    return entity
  }
}
