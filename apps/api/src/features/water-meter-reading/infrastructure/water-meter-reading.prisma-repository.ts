import { Id } from 'core'
import { PrismaClient } from 'database'
import { WaterMeterReading, WaterMeterReadingRepository } from 'features'

export class WaterMeterReadingPrismaRepository implements WaterMeterReadingRepository {
  constructor(private readonly client: PrismaClient) {}

  async findAll(): Promise<WaterMeterReading[]> {
    const readings = await this.client.waterMeterReading.findMany({
      orderBy: {
        readingDate: 'desc'
      }
    })

    return readings.map((reading) =>
      WaterMeterReading.create({
        id: reading.id,
        waterMeterId: reading.waterMeterId,
        reading: reading.reading.toString(),
        normalizedReading: reading.normalizedReading.toString(),
        readingDate: reading.readingDate,
        notes: reading.notes || undefined
      })
    )
  }

  async findById(id: Id): Promise<WaterMeterReading | undefined> {
    const reading = await this.client.waterMeterReading.findUnique({
      where: { id: id.toString() }
    })

    if (!reading) return undefined

    return WaterMeterReading.create({
      id: reading.id,
      waterMeterId: reading.waterMeterId,
      reading: reading.reading.toString(),
      normalizedReading: reading.normalizedReading.toString(),
      readingDate: reading.readingDate,
      notes: reading.notes || undefined
    })
  }

  async save(entity: WaterMeterReading): Promise<void> {
    const dto = entity.toDto()

    await this.client.waterMeterReading.upsert({
      where: { id: dto.id },
      update: {
        waterMeterId: dto.waterMeterId,
        reading: dto.reading,
        normalizedReading: dto.normalizedReading,
        readingDate: dto.readingDate,
        notes: dto.notes
      },
      create: {
        id: dto.id,
        waterMeterId: dto.waterMeterId,
        reading: dto.reading,
        normalizedReading: dto.normalizedReading,
        readingDate: dto.readingDate,
        notes: dto.notes
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.client.waterMeterReading.delete({
      where: { id: id.toString() }
    })
  }
}
