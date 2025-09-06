import type { Id } from 'core'
import type { PrismaClient } from 'database'
import { BasePrismaRepository, WaterZone, type WaterZoneRepository } from 'features'
import type { GetWaterZonesFiltersDto } from 'features/schemas/get-water-zones-filters.schema'

export class WaterZonePrismaRepository extends BasePrismaRepository implements WaterZoneRepository {
  protected readonly model = 'waterZone'
  protected getModel(): PrismaClient['waterZone'] {
    return this.db.waterZone
  }

  async save(input: WaterZone): Promise<void> {
    const update = {
      communityId: input.communityId.toString(),
      name: input.name
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

  async findById(id: Id): Promise<WaterZone | undefined> {
    const entityDto = await this.getModel().findUnique({ where: { id: id.toString() } })
    return entityDto ? WaterZone.fromDto(entityDto) : undefined
  }

  async findAll(): Promise<WaterZone[]> {
    const entityDtos = await this.getModel().findMany()
    return entityDtos.map((e) => WaterZone.fromDto(e))
  }

  async findWithFilters(filters: GetWaterZonesFiltersDto): Promise<WaterZone[]> {
    const where: { communityId?: string } = {}

    if (filters.communityId) {
      where.communityId = filters.communityId
    }
    const entityDtos = await this.getModel().findMany({ where })
    return entityDtos.map((e) => WaterZone.fromDto(e))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}
