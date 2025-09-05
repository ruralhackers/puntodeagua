import type { HttpClient, Id } from 'core'
import type { GetWaterMetersFiltersDto, WaterMeterDto, WaterMeterRepository } from 'features'
import { WaterMeter } from 'features/entities/water-meter'

export class WaterMeterApiRestRepository implements WaterMeterRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findWithFilters(filters: GetWaterMetersFiltersDto): Promise<WaterMeter[]> {
    const queryParams = new URLSearchParams()

    if (filters.zoneId) {
      queryParams.append('zoneId', filters.zoneId)
    }

    if (filters.name) {
      queryParams.append('name', filters.name)
    }

    const url = `water-meters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    // The httpClient will automatically handle authentication if it's ServerAuthHttpClient
    const response = await this.httpClient.get<WaterMeterDto[]>(url)
    const data = response.data ?? []
    return data.map(WaterMeter.create)
  }

  async findAll(): Promise<WaterMeter[]> {
    return this.findWithFilters({})
  }

  async findById(id: Id): Promise<WaterMeter | undefined> {
    try {
      const json = await this.httpClient.get<any>(`water-meters/${id.toString()}`)
      return WaterMeter.create(json.data)
    } catch (error) {
      return undefined
    }
  }

  async save(waterMeter: WaterMeter): Promise<void> {
    await this.httpClient.post<void, WaterMeterDto>('water-meters', waterMeter.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`water-meters/${id.toString()}`)
  }
}
