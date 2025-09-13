import { Id, type Query } from 'core'
import type { WaterMeter, WaterMeterRepository } from 'features'

interface GetWaterMeterParams {
  id: string
  communityId?: string
}

export class GetWaterMeterQry implements Query<WaterMeter | null, GetWaterMeterParams> {
  static readonly ID = 'GetWaterMeterQry'

  constructor(private readonly waterMeterRepository: WaterMeterRepository) {}

  async handle(params: GetWaterMeterParams): Promise<WaterMeter | null> {
    const id = Id.create(params.id)
    const result = await this.waterMeterRepository.findById(id, params.communityId)
    return result ?? null
  }
}
