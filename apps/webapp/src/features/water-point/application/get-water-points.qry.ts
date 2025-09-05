import type { Query } from 'core'
import type { GetWaterPointsFiltersDto, WaterPointRepository } from 'features'
import type { WaterPoint } from 'features/entities/water-point'

export class GetWaterPointsQry implements Query<WaterPoint[], GetWaterPointsFiltersDto> {
  static readonly ID = 'GetWaterPointsQry'

  constructor(private readonly waterPointRepository: WaterPointRepository) {}

  async handle(filters: GetWaterPointsFiltersDto = {}): Promise<WaterPoint[]> {
    const waterPoints = await this.waterPointRepository.findWithFilters(filters)
    return waterPoints
  }
}
