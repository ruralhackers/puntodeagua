import type { Query } from 'core'
import type {
  SummaryParams,
  SummaryRepository,
  SummaryResponse
} from '../infrastructure/summary.api-rest-repository'

export class GetSummaryQry implements Query<SummaryResponse, SummaryParams> {
  static readonly ID = 'GetSummaryQry'

  constructor(private readonly summaryRepository: SummaryRepository) {}

  async handle(params?: SummaryParams): Promise<SummaryResponse> {
    return await this.summaryRepository.getSummary(params)
  }
}
