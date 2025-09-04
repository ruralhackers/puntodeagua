import { Id, Query } from 'core'
import type { WaterMeterRepository } from 'features'
import type { WaterMeter } from 'features/entities/water-meter'

export class GetWaterMeterQry implements Query<WaterMeter | null, string> {
  static readonly ID = 'GetWaterMeterQry'

  constructor(private readonly waterMeterRepository: WaterMeterRepository) {}

  async handle(id: string): Promise<WaterMeter | null> {
    console.log('lo que recibe el handler', id)
    const test = Id.create(id)
    console.log('test', test)
    const result = await this.waterMeterRepository.findById(test)
    console.log('lo que retorna', result)
    return result ?? null
  }
}
