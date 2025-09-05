import type { Query } from 'core'
import { Id } from 'core'
import type { WaterPoint, WaterPointRepository } from 'features'

interface GetWaterPointParams {
  id: string
}

export class GetWaterPointQry implements Query<WaterPoint | undefined, GetWaterPointParams> {
  static readonly ID = 'GetWaterPointQry'

  constructor(private readonly waterPointRepository: WaterPointRepository) {}

  async handle(params: GetWaterPointParams): Promise<WaterPoint | undefined> {
    const id = Id.create(params.id)
    const waterPoint = await this.waterPointRepository.findById(id)
    return waterPoint
  }
}
