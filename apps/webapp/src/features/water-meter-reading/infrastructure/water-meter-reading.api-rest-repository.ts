import type { HttpClient, Id } from 'core'
import type { WaterMeterReadingDto } from 'features'
import type { CreateWaterMeterReadingCommand } from '../application/create-water-meter-reading.cmd'

export class WaterMeterReadingApiRestRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async create(command: CreateWaterMeterReadingCommand): Promise<WaterMeterReadingDto> {
    const response = await this.httpClient.post<
      WaterMeterReadingDto,
      CreateWaterMeterReadingCommand
    >('water-meter-readings', command)
    return response.data!
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`water-meter-readings/${id.toString()}`)
  }
}
