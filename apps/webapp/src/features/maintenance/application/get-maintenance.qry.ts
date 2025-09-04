import { Id, type Query } from 'core'
import type { IdSchema } from 'core/types/id.schema'
import type { Maintenance, MaintenanceRepository } from 'features'

export class GetMaintenanceQry implements Query<Maintenance | undefined, IdSchema> {
  static readonly ID = 'GetMaintenanceQry'

  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async handle(id: IdSchema): Promise<Maintenance | undefined> {
    const entity = await this.maintenanceRepository.findById(Id.create(id))
    return entity
  }
}

