import type { Command } from 'core'
import { WaterMeter, type WaterMeterRepository } from 'features'
import type { WaterMeterSchema } from 'features/schemas/water-meter.schema'

export class CreateWaterMeterCmd implements Command<Omit<WaterMeterSchema, 'id'>> {
  static readonly ID = 'CreateWaterMeterCmd'

  constructor(private readonly repo: WaterMeterRepository) {}

  async handle(dto: Omit<WaterMeterSchema, 'id'>): Promise<void> {
    const entity = WaterMeter.create(dto)
    return this.repo.save(entity)
  }
}
