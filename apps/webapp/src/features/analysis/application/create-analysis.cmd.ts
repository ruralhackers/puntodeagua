import type { Command } from 'core'
import type { AnalysisSchema } from 'features/registers/schemas/analysis.schema'
import type { AnalysisCreateRepository } from '../infrastructure/analysis.api-rest-repository'

export class CreateAnalysisCmd implements Command<Omit<AnalysisSchema, 'id'>> {
  static readonly ID = 'CreateAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisCreateRepository) {}

  async handle(createAnalysisSchema: Omit<AnalysisSchema, 'id'>): Promise<void> {
    return this.analysisRepository.create(createAnalysisSchema)
  }
}
