import type { HttpClient, Id } from 'core'
import type { WaterMeterDto, WaterMeterRepository } from 'features'
import { WaterMeter } from 'features/entities/water-meter'

export class WaterMeterApiRestRepository implements WaterMeterRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<WaterMeter[]> {
    const waterMeterDtos = await this.httpClient.get<WaterMeterDto[]>('water-meters')
    return waterMeterDtos.data!.map(WaterMeter.create)
  }

  async findById(id: Id): Promise<WaterMeter | undefined> {
    try {
      const json = await this.httpClient.get<any>(`water-meter/${id.toString()}`)
      return WaterMeter.create(json.data!)
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
