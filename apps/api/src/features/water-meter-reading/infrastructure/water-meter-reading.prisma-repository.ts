import { Id } from 'core'
import { PrismaClient } from 'database'
import { WaterMeterReading, WaterMeterReadingRepository } from 'features'

export class WaterMeterReadingPrismaRepository implements WaterMeterReadingRepository {
  constructor(private readonly client: PrismaClient) {}

  async findAll(): Promise<WaterMeterReading[]> {
    const readings = await this.client.waterMeterReading.findMany({
      include: {
        files: true
      },
      orderBy: {
        readingDate: 'desc'
      }
    })

    return readings.map((reading) => {
      const files =
        reading.files?.map((file) => ({
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          bucket: file.bucket,
          key: file.key,
          entityType: file.entityType,
          entityId: file.entityId,
          uploadedBy: file.uploadedBy,
          createdAt: file.createdAt
        })) || []

      return WaterMeterReading.create({
        id: reading.id,
        waterMeterId: reading.waterMeterId,
        reading: reading.reading.toString(),
        normalizedReading: reading.normalizedReading.toString(),
        readingDate: reading.readingDate,
        notes: reading.notes || undefined,
        files
      })
    })
  }

  async findById(id: Id): Promise<WaterMeterReading | undefined> {
    const reading = await this.client.waterMeterReading.findUnique({
      where: { id: id.toString() },
      include: {
        files: true
      }
    })

    if (!reading) return undefined

    const files =
      reading.files?.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
        bucket: file.bucket,
        key: file.key,
        entityType: file.entityType,
        entityId: file.entityId,
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt
      })) || []

    return WaterMeterReading.create({
      id: reading.id,
      waterMeterId: reading.waterMeterId,
      reading: reading.reading.toString(),
      normalizedReading: reading.normalizedReading.toString(),
      readingDate: reading.readingDate,
      notes: reading.notes || undefined,
      files
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
