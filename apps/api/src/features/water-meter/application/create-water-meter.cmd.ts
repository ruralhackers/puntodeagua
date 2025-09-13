import type { Command } from 'core'
import { WaterMeter, type WaterMeterDto, type WaterMeterRepository } from 'features'

export class CreateWaterMeterCmd implements Command<Omit<WaterMeterDto, 'id'>> {
  static readonly ID = 'CreateWaterMeterCmd'

  constructor(private readonly repo: WaterMeterRepository) {}

  async handle(dto: Omit<WaterMeterDto, 'id'>): Promise<void> {
    const entity = WaterMeter.create(dto)
    return this.repo.save(entity)
  }
}
