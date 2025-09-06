import type { Id, Query } from 'core'
import type {
  SummaryRepository,
  SummaryResponse
} from '../infrastructure/summary.api-rest-repository'

export type SummaryParams = { communityId: Id }

export class GetSummaryQry implements Query<SummaryResponse, SummaryParams> {
  static readonly ID = 'GetSummaryQry'

  constructor(private readonly summaryRepository: SummaryRepository) {}

  async handle(params?: SummaryParams): Promise<SummaryResponse> {
    return await this.summaryRepository.getSummary(params)
  }
}
