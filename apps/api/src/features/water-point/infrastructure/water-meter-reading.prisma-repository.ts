import type { Id } from 'core'
import type { PrismaClient } from 'database'
import { BasePrismaRepository, WaterMeterReading, type WaterMeterReadingRepository } from 'features'

export class WaterMeterReadingPrismaRepository
  extends BasePrismaRepository
  implements WaterMeterReadingRepository
{
  protected readonly model = 'waterMeterReading'
  protected getModel(): PrismaClient['waterMeterReading'] {
    return this.db.waterMeterReading
  }

  async findAll(): Promise<WaterMeterReading[]> {
    const readings = await this.getModel().findMany()
    return readings.map((r) => WaterMeterReading.create(r))
  }

  async findById(id: Id): Promise<WaterMeterReading | undefined> {
    const wmr = await this.getModel().findUnique({ where: { id: id.toString() } })
    return wmr ? WaterMeterReading.create(wmr) : undefined
  }

  async save(reading: WaterMeterReading): Promise<void> {
    const data = {
      id: reading.id.toString(),
      waterMeterId: reading.waterMeterId.toString(),
      timestamp: reading.timestamp,
      value: reading.value.toString()
    }
    await this.getModel().upsert({
      where: { id: reading.id.toString() },
      create: {
        ...data
      },
      update: {
        value: data.value
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}
