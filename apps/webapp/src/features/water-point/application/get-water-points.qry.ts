import type { Query } from 'core'
import type { WaterPointRepository } from 'features'
import type { WaterPoint } from 'features/entities/water-point'

export class GetWaterPointsQry implements Query<WaterPoint[]> {
  static readonly ID = 'GetWaterPointsQry'

  constructor(private readonly waterPointRepository: WaterPointRepository) {}

  async handle(): Promise<WaterPoint[]> {
    const waterPoints = await this.waterPointRepository.findAll()
    return waterPoints
  }
}
