import { Id, type Query } from 'core'
import type { WaterPoint, WaterPointRepository } from 'features'

interface GetWaterPointParams {
  id: string
  communityId?: string
}

export class GetWaterPointQry implements Query<WaterPoint, GetWaterPointParams> {
  static readonly ID = 'GetWaterPointQry'
  constructor(private readonly waterPointRepository: WaterPointRepository) {}

  async handle(params: GetWaterPointParams): Promise<WaterPoint> {
    const id = Id.create(params.id)
    const waterPoint = await this.waterPointRepository.findById(id)
    if (waterPoint === undefined) {
      throw new Error(`Water point with id ${id} not found`)
    }

    return waterPoint
  }
}
