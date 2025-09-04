import { type Command, Id } from 'core'
import type { IdSchema } from 'core/types/id.schema'
import type { AnalysisRepository } from 'features/registers/repositories/analysis.repository'

export class DeleteAnalysisCmd implements Command<IdSchema> {
  static readonly ID = 'DeleteAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(id: IdSchema): Promise<void> {
    return this.analysisRepository.delete(Id.create(id))
  }
}
