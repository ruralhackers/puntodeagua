import type { Id } from 'core'
import type { PrismaClient } from 'database'
import {
  BasePrismaRepository,
  type GetHoldersFiltersDto,
  Holder,
  type HolderRepository
} from 'features'

export class HolderPrismaRepository extends BasePrismaRepository implements HolderRepository {
  protected readonly model = 'holder'
  protected getModel(): PrismaClient['holder'] {
    return this.db.holder
  }

  async save(input: Holder): Promise<void> {
    const update = {
      name: input.name,
      nationalId: input.nationalId,
      cadastralReference: input.cadastralReference,
      description: input.description
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

  async findById(id: Id): Promise<Holder | undefined> {
    const holder = await this.getModel().findUnique({ where: { id: id.toString() } })
    return holder ? Holder.fromDto(holder) : undefined
  }

  async findAll(): Promise<Holder[]> {
    const holders = await this.getModel().findMany()
    return holders.map((h) => Holder.fromDto(h))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  async findWithFilters(filters: GetHoldersFiltersDto): Promise<Holder[]> {
    const where: {
      name?: { contains: string; mode: 'insensitive' }
      nationalId?: { contains: string; mode: 'insensitive' }
      waterMeters?: { some: { waterZone: { communityId: string } } }
    } = {}

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      }
    }

    if (filters.nationalId) {
      where.nationalId = {
        contains: filters.nationalId,
        mode: 'insensitive'
      }
    }

    if (filters.communityId) {
      where.waterMeters = {
        some: {
          waterZone: {
            communityId: filters.communityId
          }
        }
      }
    }

    const holders = await this.getModel().findMany({
      where,
      include: {
        waterMeters: {
          include: {
            waterZone: {
              include: {
                community: true
              }
            }
          }
        }
      }
    })

    return holders.map((h) => Holder.fromDto(h))
  }
}
