import type { Command } from 'core'
import { WaterPoint, type WaterPointRepository } from 'features'
import type { WaterPointSchema } from 'features/schemas/water-point.schema'

export class EditWaterPointCmd implements Command<WaterPointSchema> {
  static readonly ID = 'EditWaterPointCmd'

  constructor(private readonly repo: WaterPointRepository) {}

  async handle(dto: WaterPointSchema): Promise<void> {
    const entity = WaterPoint.fromDto(dto)
    return this.repo.save(entity)
  }
}
