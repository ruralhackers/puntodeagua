import type { HttpClient, Id } from 'core'
import {
  type GetWaterPointsFiltersDto,
  WaterPoint,
  type WaterPointDto,
  type WaterPointRepository
} from 'features'

export class WaterPointApiRestRepository implements WaterPointRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<WaterPoint[]> {
    const response = await this.httpClient.get<WaterPointDto[]>('water-points')
    const data = response.data ?? []
    return data.map(WaterPoint.create)
  }

  async findById(id: Id): Promise<WaterPoint | undefined> {
    try {
      const json = await this.httpClient.get<any>(`water-points/${id.toString()}`)
      return WaterPoint.create(json.data!)
    } catch (error) {
      return undefined
    }
  }

  async save(waterPoint: WaterPoint): Promise<void> {
    await this.httpClient.post<void, WaterPointDto>('water-points', waterPoint.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`water-points/${id.toString()}`)
  }

  async findWithFilters(filters: GetWaterPointsFiltersDto): Promise<WaterPoint[]> {
    const queryParams = new URLSearchParams()

    if (filters.communityId) {
      queryParams.append('communityId', filters.communityId)
    }
    if (filters.name) {
      queryParams.append('name', filters.name)
    }

    const response = await this.httpClient.get<WaterPointDto[]>(
      `water-points?${queryParams.toString()}`
    )
    const data = response.data ?? []
    return data.map(WaterPoint.fromDto)
  }
}
