import type { Analysis } from '../domain/entities/analysis'
import type { AnalysisRepository } from '../domain/repositories/analysis.repository'

export class AnalysisCreator {
  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async run(params: { analysis: Analysis }) {
    const { analysis } = params
    return this.analysisRepository.save(analysis)
  }
}
