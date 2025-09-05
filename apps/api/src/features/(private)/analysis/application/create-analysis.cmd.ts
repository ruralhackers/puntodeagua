import type { Command } from 'core'
import { Analysis } from 'features'
import type { AnalysisRepository } from 'features/registers/repositories/analysis.repository'
import type { AnalysisSchema } from 'features/registers/schemas/analysis.schema'

export class CreateAnalysisCmd implements Command<Omit<AnalysisSchema, 'id'>> {
  static readonly ID = 'CreateAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(createAnalysisDto: Omit<AnalysisSchema, 'id'>): Promise<void> {
    const analysis = Analysis.create(createAnalysisDto)
    return this.analysisRepository.save(analysis)
  }
}
