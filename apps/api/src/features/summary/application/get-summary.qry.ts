import type { Query } from 'core'
import type { Analysis, AnalysisRepository, Issue, IssueRepository, Maintenance, MaintenanceRepository } from 'features'

interface SummaryResponse {
  analyses: Analysis[]
  issues: Issue[]
  maintenance: Maintenance[]
}

export class GetSummaryQry implements Query<SummaryResponse> {
  static readonly ID = 'GetSummaryQry'
  
  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly issueRepository: IssueRepository,
    private readonly maintenanceRepository: MaintenanceRepository
  ) {}

  async handle(): Promise<SummaryResponse> {
    const [analyses, issues, maintenance] = await Promise.all([
      this.analysisRepository.findAllOrderedByAnalyzedAt(),
      this.issueRepository.findAllOrderedByEndAt(),
      this.maintenanceRepository.findAllOrderedByExecutionDate()
    ])

    return {
      analyses,
      issues,
      maintenance
    }
  }
}