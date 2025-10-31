import { FileMetadata } from './file-metadata'
import type { FileUploadResultDto } from './file-upload-result.dto'

export class FileUploadResult {
  private constructor(
    public readonly url: string,
    public readonly externalKey: string,
    public readonly metadata: FileMetadata
  ) {}

  static fromDto(dto: FileUploadResultDto): FileUploadResult {
    return new FileUploadResult(dto.url, dto.externalKey, FileMetadata.fromDto(dto.metadata))
  }

  static create(params: {
    url: string
    externalKey: string
    metadata: FileMetadata
  }): FileUploadResult {
    return new FileUploadResult(params.url, params.externalKey, params.metadata)
  }

  toDto(): FileUploadResultDto {
    return {
      url: this.url,
      externalKey: this.externalKey,
      metadata: this.metadata.toDto()
    }
  }

  // Helper methods
  getFileName(): string {
    return this.metadata.fileName
  }

  getFileSize(): number {
    return this.metadata.fileSize
  }

  getMimeType(): string {
    return this.metadata.mimeType
  }

  getOriginalName(): string {
    return this.metadata.originalName
  }
}

