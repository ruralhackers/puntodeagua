import type { Id } from 'core'
import type { Prisma, PrismaClient } from 'database'
import { BasePrismaRepository } from 'features'
import { Maintenance } from 'features/maintenance/entities/maintenance'
import type { MaintenanceRepository } from 'features/maintenance/repositories/maintenance.repository'

export class MaintenancePrismaRepository
  extends BasePrismaRepository
  implements MaintenanceRepository
{
  protected readonly model = 'maintenance'
  protected getModel(): PrismaClient['maintenance'] {
    return this.db.maintenance
  }

  async save(input: Maintenance): Promise<void> {
    const update = {
      waterZoneId: input.waterZoneId.toString(),
      name: input.name,
      scheduledDate: input.scheduledDate,
      responsible: input.responsible,
      executionDate: input.executionDate,
      description: input.description,
      nextMaintenanceDate: input.nextMaintenanceDate,
      observations: input.observations,
      duration: input.duration
    }

    const create = {
      ...update,
      id: input.id.toString()
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create,
      update
    })
  }

  async findById(id: Id): Promise<Maintenance | undefined> {
    const entityDto = await this.getModel().findUnique({ where: { id: id.toString() } })
    return entityDto ? Maintenance.fromDto(this.fromPrismaPayload(entityDto)) : undefined
  }

  async findAll(): Promise<Maintenance[]> {
    const entityDtos = await this.getModel().findMany()
    return entityDtos.map((c) => Maintenance.fromDto(this.fromPrismaPayload(c)))
  }

  async findAllOrderedByExecutionDate(communityId: Id): Promise<Maintenance[]> {
    const entityDtos = await this.getModel().findMany({
      where: {
        communityId: communityId.toString()
      },
      orderBy: { scheduledDate: 'asc' }
    })
    const result = entityDtos.map((c) => Maintenance.fromDto(this.fromPrismaPayload(c)))
    return result
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  private fromPrismaPayload(input: Prisma.MaintenanceGetPayload<true>) {
    return {
      id: input.id.toString(),
      waterZoneId: input.waterZoneId.toString(),
      name: input.name,
      scheduledDate: input.scheduledDate ?? undefined,
      responsible: input.responsible,
      executionDate: input.executionDate ?? undefined,
      description: input.description ?? undefined,
      nextMaintenanceDate: input.nextMaintenanceDate ?? undefined,
      communityId: input.communityId.toString(),
      observations: input.observations ?? undefined,
      duration: input.duration ?? undefined
    }
  }
}
