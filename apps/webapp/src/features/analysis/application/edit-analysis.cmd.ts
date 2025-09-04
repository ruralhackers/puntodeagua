import type { Command } from 'core'
import { Analysis } from 'features'
import type { AnalysisRepository } from 'features/registers/repositories/analysis.repository'
import type { AnalysisSchema } from 'features/registers/schemas/analysis.schema'

export class EditAnalysisCmd implements Command<AnalysisSchema> {
  static readonly ID = 'EditAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(analysis: AnalysisSchema): Promise<void> {
    return this.analysisRepository.save(Analysis.fromDto(analysis))
  }
}
