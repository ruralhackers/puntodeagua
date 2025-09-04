import type { HttpClient, Id } from 'core'
import { WaterZone, type WaterZoneDto, type WaterZoneRepository } from 'features'

export class WaterZoneApiRestRepository implements WaterZoneRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<WaterZone[]> {
    const dtos = await this.httpClient.get<WaterZoneDto[]>('water-zones')
    const data = dtos.data ?? []
    return data.map(WaterZone.fromDto)
  }

  async findById(id: Id): Promise<WaterZone | undefined> {
    try {
      const json = await this.httpClient.get<WaterZoneDto>(`water-zones/${id.toString()}`)
      const data = json.data
      if (!data) return undefined
      return WaterZone.fromDto(data)
    } catch {
      return undefined
    }
  }

  async save(waterZone: WaterZone): Promise<void> {
    await this.httpClient.post<void, WaterZoneDto>('water-zones', waterZone.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`water-zones/${id.toString()}`)
  }
}
