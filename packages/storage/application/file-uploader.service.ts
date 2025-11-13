import type { Id } from '@pda/common/domain'
import {
  type FileEntityType,
  type FileMetadata,
  FileSizeExceededError,
  getMaxFileSize,
  InvalidFileTypeError,
  VALID_FILE_TYPES
} from '../domain'
import type { EntityFileRepository } from '../domain/repositories/entity-file.repository'
import type { FileStorageRepository } from '../domain/repositories/file-storage.repository'

export interface FileUploadParams<T> {
  file: Buffer
  entityId: Id
  entityType: FileEntityType
  metadata: FileMetadata
  storageFolder: string // e.g., 'water-meters', 'incidents'
  createEntity: (uploadResult: { url: string; externalKey: string; metadata: FileMetadata }) => T
}

export class FileUploaderService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly repositoryMap: Map<FileEntityType, EntityFileRepository<unknown>>
  ) {}

  async run<T>(params: FileUploadParams<T>): Promise<string> {
    const { file, entityId, entityType, metadata, storageFolder, createEntity } = params

    // Validate file
    this.validateFile(metadata)

    // Get appropriate repository
    const repository = this.repositoryMap.get(entityType)
    if (!repository) {
      throw new Error(`No repository configured for entity type: ${entityType}`)
    }

    // Upload to storage
    const uploadResult = await this.fileStorageRepository.upload(
      file,
      metadata,
      entityId.toString(),
      storageFolder
    )

    // Create entity using provided factory function
    const fileEntity = createEntity({
      url: uploadResult.url,
      externalKey: uploadResult.externalKey,
      metadata: uploadResult.metadata
    })

    // Save to database
    await repository.save(fileEntity)

    return uploadResult.url
  }

  private validateFile(metadata: FileMetadata): void {
    // Validate file type
    if (!VALID_FILE_TYPES.includes(metadata.mimeType as never)) {
      throw new InvalidFileTypeError(metadata.mimeType)
    }

    // Validate file size based on type
    const maxSize = getMaxFileSize(metadata.mimeType)
    if (metadata.fileSize > maxSize) {
      throw new FileSizeExceededError(metadata.fileSize, maxSize)
    }
  }
}
