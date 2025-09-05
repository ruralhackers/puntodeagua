import type { Query } from 'core'
import type { Analysis, AnalysisRepository, Issue, IssueRepository, Maintenance, MaintenanceRepository } from 'features'

interface SummaryResponse {
  analyses: Analysis[]
  issues: Issue[]
  maintenance: Maintenance[]
}

interface SummaryParams {
  month?: number
  year?: number
}

export class GetSummaryQry implements Query<SummaryResponse> {
  static readonly ID = 'GetSummaryQry'
  
  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly issueRepository: IssueRepository,
    private readonly maintenanceRepository: MaintenanceRepository
  ) {}

  async handle(params: SummaryParams = {}): Promise<SummaryResponse> {
    let { month, year } = params
    
    // Default to previous month if not provided
    if (!month || !year) {
      const now = new Date()
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      month = prevMonth.getMonth() + 1 // Convert back to 1-indexed
      year = prevMonth.getFullYear()
    }
    
    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1) // month is 0-indexed in Date constructor
    const endDate = new Date(year, month, 1) // first day of next month
    
    const [analyses, issues, maintenance] = await Promise.all([
      this.analysisRepository.findAllOrderedByAnalyzedAt(startDate, endDate),
      this.issueRepository.findAllOrderedByEndAt(startDate, endDate),
      this.maintenanceRepository.findAllOrderedByExecutionDate(startDate, endDate)
    ])

    return {
      analyses,
      issues,
      maintenance
    }
  }
}