import { Id } from 'core'
import type { FileSchema } from '../schemas/file.schema.ts'
import type { FileDto } from './file.dto.ts'

export class File {
  private constructor(
    public readonly id: Id,
    public readonly filename: string,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly url: string,
    public readonly bucket: string,
    public readonly key: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly uploadedBy: Id,
    public readonly createdAt: Date
  ) {}

  static create({
    id,
    filename,
    originalName,
    mimeType,
    size,
    url,
    bucket,
    key,
    entityType,
    entityId,
    uploadedBy,
    createdAt
  }: FileSchema) {
    return new File(
      Id.create(id),
      filename,
      originalName,
      mimeType,
      size,
      url,
      bucket,
      key,
      entityType,
      entityId,
      Id.create(uploadedBy),
      createdAt
    )
  }

  toDto(): FileDto {
    return {
      id: this.id.toString(),
      filename: this.filename,
      originalName: this.originalName,
      mimeType: this.mimeType,
      size: this.size,
      url: this.url,
      bucket: this.bucket,
      key: this.key,
      entityType: this.entityType,
      entityId: this.entityId,
      uploadedBy: this.uploadedBy.toString(),
      createdAt: this.createdAt
    }
  }
}
