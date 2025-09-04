import type { HttpClient, Id } from 'core'
import type { WaterPointRepository } from 'features'
import { WaterPoint } from 'features/entities/water-point'
import { WaterPointDto } from 'features/entities/water-point.dto'

export class WaterPointApiRestRepository implements WaterPointRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<WaterPoint[]> {
    const waterPointDtos = await this.httpClient.get<WaterPointDto[]>('water-points')
    return waterPointDtos.data!.map(WaterPoint.create)
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
}
