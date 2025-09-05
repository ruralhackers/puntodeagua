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
        waterZone: {
          include: {
            community: true
          }
        },
        waterPoint: true,
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
          readings: wm.waterMeterReadings
            .reverse()
            .map((reading, index, arr) => {
              let consumption = 0
              let excessConsumption = false

              if (index > 0 && arr[index - 1]) {
                const currentValue = parseFloat(reading.normalizedReading.toString())
                const previousValue = parseFloat(arr[index - 1].normalizedReading.toString())
                consumption = currentValue - previousValue

                const daysBetween = Math.ceil(
                  (reading.readingDate.getTime() - arr[index - 1].readingDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                const dailyLimitPerPerson = wm.waterZone.community.dailyWaterLimitLitersPerPerson
                const totalPopulation =
                  wm.waterPoint.fixedPopulation + wm.waterPoint.floatingPopulation
                const totalDailyLimit = dailyLimitPerPerson * totalPopulation
                excessConsumption =
                  daysBetween > 0 &&
                  totalPopulation > 0 &&
                  consumption / daysBetween > totalDailyLimit
              }

              return {
                id: reading.id,
                readingDate: reading.readingDate,
                reading: reading.reading.toString(),
                normalizedReading: reading.normalizedReading.toString(),
                consumption,
                'excess-consumption': excessConsumption
              }
            })
            .reverse()
        })
      : undefined
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
        waterZone: {
          include: {
            community: true
          }
        },
        waterPoint: true,
        waterMeterReadings: {
          orderBy: { readingDate: 'desc' },
          take: 2
        }
      }
    })

    return waterMeters.map((wm) =>
      WaterMeter.create({
        ...wm,
        waterZoneName: wm.waterZone.name,
        lastReadingValue: wm.waterMeterReadings[0]?.reading?.toString(),
        lastReadingDate: wm.waterMeterReadings[0]?.readingDate,
        readings: wm.waterMeterReadings
          .reverse()
          .map((reading, index, arr) => {
            let consumption = 0
            let excessConsumption = false

            if (index > 0 && arr[index - 1]) {
              const currentValue = parseFloat(reading.normalizedReading.toString())
              const previousValue = parseFloat(arr[index - 1].normalizedReading.toString())
              consumption = currentValue - previousValue

              const daysBetween = Math.ceil(
                (reading.readingDate.getTime() - arr[index - 1].readingDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
              const dailyLimitPerPerson = wm.waterZone.community.dailyWaterLimitLitersPerPerson
              const totalPopulation =
                wm.waterPoint.fixedPopulation + wm.waterPoint.floatingPopulation
              const totalDailyLimit = dailyLimitPerPerson * totalPopulation
              excessConsumption =
                daysBetween > 0 &&
                totalPopulation > 0 &&
                consumption / daysBetween > totalDailyLimit
            }

            return {
              id: reading.id,
              readingDate: reading.readingDate,
              reading: reading.reading.toString(),
              normalizedReading: reading.normalizedReading.toString(),
              consumption,
              'excess-consumption': excessConsumption
            }
          })
          .reverse()
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
