import { File, type FileRepository, type Id } from 'core'
import type { PrismaClient } from 'database'

export class FilePrismaRepository implements FileRepository {
  constructor(private readonly client: PrismaClient) {}

  async findAll(): Promise<File[]> {
    const files = await this.client.file.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return files.map((file) => File.fromDto(file))
  }

  async findById(id: Id): Promise<File | undefined> {
    const file = await this.client.file.findUnique({
      where: { id: id.toString() }
    })

    if (!file) return undefined

    return File.fromDto(file)
  }

  async findByEntity(entityType: string, entityId: string): Promise<File[]> {
    const files = await this.client.file.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' }
    })

    return files.map((file) => File.fromDto(file))
  }

  async save(entity: File): Promise<void> {
    const dto = entity.toDto()

    await this.client.file.upsert({
      where: { id: dto.id },
      update: {
        filename: dto.filename,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        size: dto.size,
        url: dto.url,
        bucket: dto.bucket,
        key: dto.key,
        entityType: dto.entityType,
        entityId: dto.entityId,
        uploadedBy: dto.uploadedBy,
        createdAt: dto.createdAt
      },
      create: {
        id: dto.id,
        filename: dto.filename,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        size: dto.size,
        url: dto.url,
        bucket: dto.bucket,
        key: dto.key,
        entityType: dto.entityType,
        entityId: dto.entityId,
        uploadedBy: dto.uploadedBy,
        createdAt: dto.createdAt
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.client.file.delete({
      where: { id: id.toString() }
    })
  }

  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    await this.client.file.deleteMany({
      where: { entityType, entityId }
    })
  }
}
