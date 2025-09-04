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
    const data = {
      id: input.id.toString(),
      name: input.name,
      holderId: input.holderId.toString(),
      waterPointId: input.waterPointId.toString(),
      waterZoneId: input.waterZoneId.toString(),
      measurementUnit: input.measurementUnit.toString(),
      images: input.images
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create: {
        ...data
      },
      update: {
        name: data.name,
        waterZoneId: data.waterZoneId,
        measurementUnit: data.measurementUnit,
        images: data.images
      }
    })
  }

  async findById(id: Id): Promise<WaterMeter | undefined> {
    const wm = await this.getModel().findUnique({
      where: { id: id.toString() },
      include: {
        waterZone: true,
        waterMeterReadings: {
          orderBy: { readingDate: 'desc' },
          take: 8
        }
      }
    })
    return wm
      ? WaterMeter.create({
          ...wm,
          waterZoneName: wm.waterZone.name,
          readings: wm.waterMeterReadings.map((reading) => ({
            readingDate: reading.readingDate,
            reading: reading.reading.toString(),
            normalizedReading: reading.normalizedReading.toString()
          }))
        })
      : undefined
  }

  async findWithFilters(filters: GetWaterMetersFiltersDto): Promise<WaterMeter[]> {
    const where: any = {}

    if (filters.zoneId) {
      where.waterZoneId = filters.zoneId
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      }
    }

    const waterMeters = await this.getModel().findMany({
      where,
      include: {
        waterZone: true,
        waterMeterReadings: {
          orderBy: { readingDate: 'desc' },
          take: 1
        }
      }
    })

    return waterMeters.map((wm) =>
      WaterMeter.create({
        ...wm,
        waterZoneName: wm.waterZone.name,
        lastReadingValue: wm.waterMeterReadings[0]?.reading?.toString(),
        lastReadingDate: wm.waterMeterReadings[0]?.readingDate
      })
    )
  }

  async findAll(): Promise<WaterMeter[]> {
    return this.findWithFilters({})
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}
