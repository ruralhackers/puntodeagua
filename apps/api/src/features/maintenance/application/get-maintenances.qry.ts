import type { Query } from 'core'
import type { Maintenance, MaintenanceRepository } from 'features'

export class GetMaintenancesQry implements Query<Maintenance[]> {
  static readonly ID = 'GetMaintenancesQry'
  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async handle(): Promise<Maintenance[]> {
    return this.maintenanceRepository.findAll()
  }
}
