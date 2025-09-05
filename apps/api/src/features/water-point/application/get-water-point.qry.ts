import type { Id, Query } from 'core'
import type { WaterPoint, WaterPointRepository } from 'features'

export class GetWaterPointQry implements Query<WaterPoint | undefined, Id> {
  static readonly ID = 'GetWaterPointQry'
  constructor(private readonly repo: WaterPointRepository) {}

  async handle(id: Id): Promise<WaterPoint | undefined> {
    return this.repo.findById(id)
  }
}
