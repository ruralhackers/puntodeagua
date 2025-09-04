import type { Command } from 'core'
import { Maintenance, type MaintenanceRepository, type MaintenanceSchema } from 'features'

export class EditMaintenanceCmd implements Command<MaintenanceSchema> {
  static readonly ID = 'EditMaintenanceCmd'

  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async handle(data: MaintenanceSchema): Promise<void> {
    const maintenance = Maintenance.fromDto(data)
    await this.maintenanceRepository.save(maintenance)
  }
}

