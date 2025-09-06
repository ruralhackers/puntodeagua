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
    console.log('params en get summary qry', { params })
    const [analyses, issues, maintenance] = await Promise.all([
      this.analysisRepository.findAllOrderedByAnalyzedAt(params.communityId),
      this.issueRepository.findAllOrderedByEndAt(params.communityId),
      this.maintenanceRepository.findAllOrderedByExecutionDate(params.communityId)
    ])
    console.log('analyses en get summary qry', { analyses })
    console.log('issues en get summary qry', { issues })
    console.log('maintenance en get summary qry', { maintenance })

    return {
      analyses,
      issues,
      maintenance
    }
  }
}
