import type { Query } from 'core'
import type {
  Analysis,
  AnalysisRepository,
  Issue,
  Maintenance,
  MaintenanceRepository
} from 'features'
import type { IssueApiRepository } from '../../issue/domain/issue.api-repository'

interface SummaryResponse {
  analyses: Analysis[]
  issues: Issue[]
  maintenance: Maintenance[]
}

interface SummaryParams {
  month?: number
  year?: number
}

export class GetSummaryQry implements Query<SummaryResponse, SummaryParams> {
  static readonly ID = 'GetSummaryQry'

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly issueRepository: IssueApiRepository,
    private readonly maintenanceRepository: MaintenanceRepository
  ) {}

  async handle(params?: SummaryParams): Promise<SummaryResponse> {
    const { month, year } = params || {}

    let startDate: Date | undefined
    let endDate: Date | undefined

    // Only filter by date if both month and year are provided
    if (month && year) {
      startDate = new Date(year, month - 1, 1) // month is 0-indexed in Date constructor
      endDate = new Date(year, month, 1) // first day of next month
    }

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
