import { Id } from 'core'
import type { MaintenanceSchema } from '../schemas/maintenance.schema'

export class Maintenance {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly waterZoneId: Id,
    public readonly communityId: Id,
    public readonly scheduledDate: Date,
    public readonly responsible: string,
    public readonly executionDate?: Date,
    public readonly description?: string,
    public readonly nextMaintenanceDate?: Date,
    public readonly observations?: string,
    public readonly duration?: number
  ) {}

  static create(maintenanceSchema: Omit<MaintenanceSchema, 'id'>) {
    return new Maintenance(
      Id.generateUniqueId(),
      maintenanceSchema.name,
      Id.create(maintenanceSchema.waterZoneId),
      Id.create(maintenanceSchema.communityId),
      maintenanceSchema.scheduledDate,
      maintenanceSchema.responsible,
      maintenanceSchema.executionDate,
      maintenanceSchema.description,
      maintenanceSchema.nextMaintenanceDate,
      maintenanceSchema.observations,
      maintenanceSchema.duration
    )
  }

  static fromDto(dto: MaintenanceSchema): Maintenance {
    return new Maintenance(
      Id.create(dto.id),
      dto.name,
      Id.create(dto.waterZoneId),
      Id.create(dto.communityId),
      dto.scheduledDate,
      dto.responsible,
      dto.executionDate,
      dto.description,
      dto.nextMaintenanceDate,
      dto.observations,
      dto.duration
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
      waterZoneId: this.waterZoneId.toString(),
      communityId: this.communityId.toString(),
      scheduledDate: this.scheduledDate,
      executionDate: this.executionDate,
      responsible: this.responsible,
      description: this.description,
      nextMaintenanceDate: this.nextMaintenanceDate,
      observations: this.observations,
      duration: this.duration
    }
  }
}
