import type { HttpClient } from 'core'
import type {Analysis, Issue, Maintenance, WaterZone} from 'features'

export interface SummaryResponse {
  analyses: Analysis[]
  issues: Issue[]
  maintenance: Maintenance[]
  waterZones: WaterZone[]
}

export interface SummaryParams {
  month?: number
  year?: number
}

export interface SummaryRepository {
  getSummary(params?: SummaryParams): Promise<SummaryResponse>
}

export class SummaryApiRestRepository implements SummaryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getSummary(params?: SummaryParams): Promise<SummaryResponse> {
    const queryParams = new URLSearchParams()

    if (params?.month) {
      queryParams.append('month', params.month.toString())
    }

    if (params?.year) {
      queryParams.append('year', params.year.toString())
    }

    const endpoint = queryParams.toString() ? `summary?${queryParams.toString()}` : 'summary'

    const response = await this.httpClient.get<SummaryResponse>(endpoint)

    if (!response.data) {
      throw new Error('Failed to fetch summary data')
    }

    return response.data
  }
}
