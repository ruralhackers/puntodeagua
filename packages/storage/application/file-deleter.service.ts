import type { Id } from '@pda/common/domain'
import type { FileEntityType } from '../domain/entities/file-entity-type'
import type { EntityFileRepository } from '../domain/repositories/entity-file.repository'
import type { FileStorageRepository } from '../domain/repositories/file-storage.repository'

export interface FileDeleteParams {
  fileId: Id
  entityType: FileEntityType
}

export class FileDeleterService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly repositoryMap: Map<FileEntityType, EntityFileRepository<unknown>>
  ) {}

  async run(params: FileDeleteParams): Promise<void> {
    const { fileId, entityType } = params

    // Get appropriate repository
    const repository = this.repositoryMap.get(entityType)
    if (!repository) {
      throw new Error(`No repository configured for entity type: ${entityType}`)
    }

    // Get the file entity from database
    const fileEntity = await repository.findById(fileId)
    if (!fileEntity) {
      return // File not found, nothing to delete
    }

    // Extract externalKey - assume all file entities have this property
    const externalKey = (fileEntity as Record<string, unknown>).externalKey as string
    if (!externalKey) {
      throw new Error('File entity does not have externalKey property')
    }

    // Delete from storage
    await this.fileStorageRepository.delete(externalKey)

    // Delete from database
    await repository.delete(fileId)
  }
}
