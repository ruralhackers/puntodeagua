import type { Id } from 'core'
import type { WaterMeterReadingDto } from 'features'
import type { AuthHttpClient } from '../../auth/infrastructure/auth-http-client'
import type { CreateWaterMeterReadingCommand } from '../application/create-water-meter-reading.cmd'

export class WaterMeterReadingAuthApiRestRepository {
  constructor(private readonly authHttpClient: AuthHttpClient) {}

  async create(command: CreateWaterMeterReadingCommand): Promise<WaterMeterReadingDto> {
    const response = await this.authHttpClient.post<
      WaterMeterReadingDto,
      CreateWaterMeterReadingCommand
    >('water-meter-readings', command)
    if (!response.data) {
      throw new Error('No data received from server')
    }
    return response.data
  }

  async delete(id: Id): Promise<void> {
    await this.authHttpClient.delete(`water-meter-readings/${id.toString()}`)
  }
}
