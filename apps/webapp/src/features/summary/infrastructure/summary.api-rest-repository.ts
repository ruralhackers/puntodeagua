import type { HttpClient } from 'core'
import type { Analysis, Issue, Maintenance, WaterZone } from 'features'
import type { SummaryParams } from '@/src/features/summary/application/get-summary.qry'

export interface SummaryResponse {
  analyses: Analysis[]
  issues: Issue[]
  maintenance: Maintenance[]
  waterZones: WaterZone[]
}

export interface SummaryRepository {
  getSummary(params: SummaryParams): Promise<SummaryResponse>
}

export class SummaryApiRestRepository implements SummaryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getSummary(params: SummaryParams): Promise<SummaryResponse> {
    const response = await this.httpClient.get<SummaryResponse>(`summary/${params?.communityId}`)
    return response.data!
  }
}
