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
          readings: wm.waterMeterReadings.map((reading, index, arr) => {
            // Calculate consumption: current reading - previous reading
            // For the oldest reading (last in desc order), consumption is 0
            let consumption = 0
            if (index < arr.length - 1) {
              const currentValue = parseFloat(reading.normalizedReading.toString())
              const previousValue = parseFloat(arr[index + 1].normalizedReading.toString())
              consumption = currentValue - previousValue
            }
            
            // Calculate excess-consumption flag
            // Compare current consumption with previous consumption (if exists)
            let excessConsumption = false
            if (index > 0 && index < arr.length - 1) {
              // Get previous reading's consumption (reading at index - 1)
              const previousReading = arr[index - 1]
              let previousConsumption = 0
              if (index - 1 < arr.length - 1) {
                const prevCurrentValue = parseFloat(previousReading.normalizedReading.toString())
                const prevPreviousValue = parseFloat(arr[index].normalizedReading.toString())
                previousConsumption = prevCurrentValue - prevPreviousValue
              }
              excessConsumption = consumption - previousConsumption > 0.1
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
        readings: wm.waterMeterReadings.map((reading, index, arr) => {
          // Calculate consumption: current reading - previous reading
          // For the oldest reading (last in desc order), consumption is 0
          let consumption = 0
          if (index < arr.length - 1) {
            const currentValue = parseFloat(reading.normalizedReading.toString())
            const previousValue = parseFloat(arr[index + 1].normalizedReading.toString())
            consumption = currentValue - previousValue
          }
          
          // Calculate excess-consumption flag
          // Compare current consumption with previous consumption (if exists)
          let excessConsumption = false
          if (index > 0 && index < arr.length - 1) {
            // Get previous reading's consumption (reading at index - 1)
            const previousReading = arr[index - 1]
            let previousConsumption = 0
            if (index - 1 < arr.length - 1) {
              const prevCurrentValue = parseFloat(previousReading.normalizedReading.toString())
              const prevPreviousValue = parseFloat(arr[index].normalizedReading.toString())
              previousConsumption = prevCurrentValue - prevPreviousValue
            }
            excessConsumption = consumption - previousConsumption > 0.1
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
