import type { Command } from 'core'
import { WaterPoint, type WaterPointRepository } from 'features'
import type { WaterPointSchema } from 'features/schemas/water-point.schema'

export class CreateWaterPointCmd implements Command<Omit<WaterPointSchema, 'id'>> {
  static readonly ID = 'CreateWaterPointCmd'

  constructor(private readonly repo: WaterPointRepository) {}

  async handle(dto: Omit<WaterPointSchema, 'id'>): Promise<void> {
    const entity = WaterPoint.create(dto)
    return this.repo.save(entity)
  }
}
