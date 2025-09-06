import type { Query } from 'core'
import type {
  Analysis,
  AnalysisRepository,
  Issue,
  Maintenance,
  MaintenanceRepository
} from 'features'
import type { SummaryParams } from 'webapp/src/features/summary/application/get-summary.qry'
import type { IssueApiRepository } from '../../issue/domain/issue.api-repository'

interface SummaryResponse {
  analyses: Analysis[]
  issues: Issue[]
  maintenance: Maintenance[]
}

export class GetSummaryQry implements Query<SummaryResponse, SummaryParams> {
  static readonly ID = 'GetSummaryQry'

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly issueRepository: IssueApiRepository,
    private readonly maintenanceRepository: MaintenanceRepository
  ) {}

  async handle(params: SummaryParams): Promise<SummaryResponse> {
    const [analyses, issues, maintenance] = await Promise.all([
      this.analysisRepository.findAllOrderedByAnalyzedAt(params.communityId),
      this.issueRepository.findAllOrderedByEndAt(params.communityId),
      this.maintenanceRepository.findAllOrderedByExecutionDate(params.communityId)
    ])

    return {
      analyses,
      issues,
      maintenance
    }
  }
}
