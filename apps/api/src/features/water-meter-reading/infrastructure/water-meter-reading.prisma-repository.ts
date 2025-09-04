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
    const readings = await this.getModel().findMany({
      include: { attachments: true },
      orderBy: { readingDate: 'desc' }
    })
    console.log('readings', readings)
    return readings.map((r) => WaterMeterReading.create(r))
  }

  async findById(id: Id): Promise<WaterMeterReading | undefined> {
    const wmr = await this.getModel().findUnique({
      where: { id: id.toString() },
      include: { attachments: true }
    })
    return wmr ? WaterMeterReading.create(wmr) : undefined
  }

  async save(reading: WaterMeterReading): Promise<void> {
    const data = {
      id: reading.id.toString(),
      waterMeterId: reading.waterMeterId.toString(),
      readingDate: reading.readingDate.toISOString(),
      reading: reading.reading.toString(),
      notes: reading.notes,
      attachments: reading.attachments?.map((a) => a.toDto())
    }
    await this.getModel().upsert({
      where: { id: reading.id.toString() },
      create: {
        ...data
      },
      update: {
        reading: data.reading,
        readingDate: data.readingDate,
        notes: data.notes,
        attachments: data.attachments ?? []
      }
    })

    if (reading.attachments && reading.attachments.length > 0) {
      for (const attachment of reading.attachments) {
        await this.db.fileAttachment.upsert({
          where: { id: attachment.id.toString() },
          create: {
            id: attachment.id.toString(),
            originalName: attachment.originalName,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
            size: attachment.size,
            path: attachment.path,
            waterMeterReadingId: reading.id.toString()
          },
          update: {
            originalName: attachment.originalName,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
            size: attachment.size,
            path: attachment.path
          }
        })
      }
    }
  }

  async delete(id: Id): Promise<void> {
    await this.db.fileAttachment.deleteMany({
      where: { waterMeterReadingId: id.toString() }
    })
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  async findByWaterMeterId(waterMeterId: string): Promise<WaterMeterReading[]> {
    const readings = await this.getModel().findMany({
      where: { waterMeterId },
      include: { attachments: true },
      orderBy: { readingDate: 'desc' }
    })
    return readings.map((reading) => WaterMeterReading.create(reading))
  }
}
