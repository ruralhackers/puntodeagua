import type { Query } from 'core'
import { Id } from 'core'
import type { WaterMeterRepository } from 'features'
import type { WaterMeter } from 'features/entities/water-meter'

export class GetWaterMeterQry implements Query<WaterMeter | null, string> {
  static readonly ID = 'GetWaterMeterQry'

  constructor(private readonly waterMeterRepository: WaterMeterRepository) {}

  async handle(id: string): Promise<WaterMeter | null> {
    const test = Id.create(id)
    const result = await this.waterMeterRepository.findById(test)
    console.log(result?.toDto())
    return result ?? null
  }
}
