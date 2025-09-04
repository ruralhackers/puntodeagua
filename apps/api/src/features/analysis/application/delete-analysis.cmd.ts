import type { Command, Id } from 'core'
import type { AnalysisRepository } from 'features/registers/repositories/analysis.repository'

export class DeleteAnalysisCmd implements Command<Id> {
  static readonly ID = 'DeleteAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(id: Id): Promise<void> {
    return this.analysisRepository.delete(id)
  }
}
