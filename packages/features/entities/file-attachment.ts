import { Id } from 'core'
import type { FileAttachmentSchema } from '../schemas/file-attachment.schema'

export class FileAttachment {
  private constructor(
    public readonly id: Id,
    public readonly originalName: string,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly path: string
  ) {}

  static create(data: FileAttachmentSchema) {
    return new FileAttachment(
      Id.create(data.id),
      data.originalName,
      data.fileName,
      data.mimeType,
      data.size,
      data.path
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      originalName: this.originalName,
      fileName: this.fileName,
      mimeType: this.mimeType,
      size: this.size,
      path: this.path
    }
  }
}
