import { Id, type Query } from 'core'
import type { WaterPoint, WaterPointRepository } from 'features'

interface GetWaterPointParams {
  id: string
  communityId?: string
}

export class GetWaterPointQry implements Query<WaterPoint | undefined, GetWaterPointParams> {
  static readonly ID = 'GetWaterPointQry'
  constructor(private readonly repo: WaterPointRepository) {}

  async handle(params: GetWaterPointParams): Promise<WaterPoint | undefined> {
    const id = Id.create(params.id)
    return this.repo.findById(id)
  }
}
