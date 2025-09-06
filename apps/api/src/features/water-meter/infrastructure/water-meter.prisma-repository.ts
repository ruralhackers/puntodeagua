import type { Id } from 'core'
import type { PrismaClient } from 'database'
import type { GetWaterMetersFiltersDto } from 'features'
import { BasePrismaRepository, WaterMeter, type WaterMeterRepository } from 'features'

export class WaterMeterPrismaRepository
  extends BasePrismaRepository
  implements WaterMeterRepository
{
  protected readonly model = 'waterMeter'
  protected getModel(): PrismaClient['waterMeter'] {
    return this.db.waterMeter
  }

  async save(input: WaterMeter): Promise<void> {
    const update = {
      name: input.name,
      measurementUnit: input.measurementUnit.toString(),
      images: input.images,
      waterZoneId: input.waterZoneId.toString()
    }

    const create = {
      ...update,
      id: input.id.toString(),
      holderId: input.holderId.toString(),
      waterPointId: input.waterPoint.id.toString()
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create,
      update
    })
  }

  async findById(id: Id, communityId?: string): Promise<WaterMeter | undefined> {
    const where: { id: string; waterZone?: { communityId: string } } = { id: id.toString() }

    // Add community filter if provided
    if (communityId) {
      where.waterZone = {
        communityId: communityId
      }
    }

    const wm = await this.getModel().findUnique({
      where,
      include: {
        waterPoint: true,
        waterMeterReadings: {
          orderBy: { readingDate: 'desc' },
          take: 8
        }
      }
    })
    return wm ? WaterMeter.fromDto(wm) : undefined
  }

  async findWithFilters(filters: GetWaterMetersFiltersDto): Promise<WaterMeter[]> {
    const where: {
      waterZoneId?: string
      name?: { contains: string; mode: 'insensitive' }
      waterZone?: { communityId: string }
    } = {}

    if (filters.zoneId) {
      where.waterZoneId = filters.zoneId
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      }
    }

    if (filters.communityId) {
      where.waterZone = {
        communityId: filters.communityId
      }
    }

    const waterMeters = await this.getModel().findMany({
      where,
      include: {
        waterPoint: true,
        waterMeterReadings: {
          orderBy: { readingDate: 'desc' },
          take: 2
        }
      }
    })

    return waterMeters.map((wm) => WaterMeter.fromDto(wm))
  }

  async findAll(): Promise<WaterMeter[]> {
    return this.findWithFilters({})
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}
