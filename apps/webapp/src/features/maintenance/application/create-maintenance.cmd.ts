import type { Command } from 'core'
import { Maintenance, type MaintenanceRepository, type MaintenanceSchema } from 'features'

export class CreateMaintenanceCmd implements Command<Omit<MaintenanceSchema, 'id'>> {
  static readonly ID = 'CreateMaintenanceCmd'

  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async handle(data: Omit<MaintenanceSchema, 'id'>): Promise<void> {
    const maintenance = Maintenance.create(data)
    await this.maintenanceRepository.save(maintenance)
  }
}
