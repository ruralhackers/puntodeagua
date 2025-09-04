import type { Command } from 'core'
import { Analysis } from 'features'
import type { AnalysisRepository } from 'features/registers/repositories/analysis.repository'
import type { AnalysisSchema } from 'features/registers/schemas/analysis.schema'

export class CreateAnalysisCmd implements Command<Omit<AnalysisSchema, 'id'>> {
  static readonly ID = 'CreateAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(createAnalysisSchema: Omit<AnalysisSchema, 'id'>): Promise<void> {
    return this.analysisRepository.save(Analysis.create(createAnalysisSchema))
  }
}
