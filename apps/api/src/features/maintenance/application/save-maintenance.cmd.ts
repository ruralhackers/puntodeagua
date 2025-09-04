import type { Command } from 'core'
import { Maintenance, type MaintenanceRepository, type MaintenanceSchema } from 'features'

export class SaveMaintenanceCmd implements Command<MaintenanceSchema> {
  static readonly ID = 'SaveMaintenanceCmd'

  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async handle(input: MaintenanceSchema): Promise<void> {
    const maintenance = Maintenance.fromDto(input)
    await this.maintenanceRepository.save(maintenance)
  }
}
