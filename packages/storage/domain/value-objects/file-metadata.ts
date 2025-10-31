import type { FileMetadataDto } from './file-metadata.dto'

export class FileMetadata {
  private constructor(
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly originalName: string
  ) {}

  static fromDto(dto: FileMetadataDto): FileMetadata {
    return new FileMetadata(dto.fileName, dto.fileSize, dto.mimeType, dto.originalName)
  }

  static create(params: {
    fileName: string
    fileSize: number
    mimeType: string
    originalName: string
  }): FileMetadata {
    return new FileMetadata(params.fileName, params.fileSize, params.mimeType, params.originalName)
  }

  toDto(): FileMetadataDto {
    return {
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      originalName: this.originalName
    }
  }

  getFileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || ''
  }
}

