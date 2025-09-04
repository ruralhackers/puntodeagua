import type { Query } from 'core'
import type { WaterZone, WaterZoneRepository } from 'features'

export class GetWaterZonesQry implements Query<WaterZone[]> {
  static readonly ID = 'GetWaterZonesQry'
  constructor(private readonly repo: WaterZoneRepository) {}

  async handle(): Promise<WaterZone[]> {
    return this.repo.findAll()
  }
}
