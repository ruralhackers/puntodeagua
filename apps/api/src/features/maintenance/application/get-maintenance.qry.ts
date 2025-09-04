import type { Id, Query } from 'core'
import type { Maintenance } from 'features'
import type { MaintenanceRepository } from 'features/maintenance/repositories/maintenance.repository'

export class GetMaintenanceQry implements Query<Maintenance | undefined, Id> {
  static readonly ID = 'GetMaintenanceQry'

  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async handle(id: Id): Promise<Maintenance | undefined> {
    return this.maintenanceRepository.findById(id)
  }
}
