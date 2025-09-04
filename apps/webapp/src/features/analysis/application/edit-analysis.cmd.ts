import type { Command } from 'core'
import { Analysis, type AnalysisDto } from 'features'
import type { AnalysisRepository } from 'features/registers/repositories/analysis.repository'

export class EditAnalysisCmd implements Command<AnalysisDto> {
  static readonly ID = 'EditAnalysisCmd'

  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async handle(analysis: AnalysisDto): Promise<void> {
    return this.analysisRepository.save(Analysis.fromDto(analysis))
  }
}
