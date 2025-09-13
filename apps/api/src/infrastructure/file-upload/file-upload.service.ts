import type { FileRepository, StorageService, UploadOptions } from 'core'
import { File } from 'core'
import type {} from 'features'

export class FileUploadService {
  constructor(
    private readonly storageService: StorageService,
    private readonly fileRepository: FileRepository
  ) {}

  /**
   * Upload a file and save its metadata to the database
   */
  async uploadFile(file: Buffer, options: UploadOptions): Promise<File> {
    // Upload file to cloud storage
    const uploadResult = await this.storageService.upload(file, options)

    // Create file entity
    const fileEntity = File.create({
      filename: uploadResult.filename,
      originalName: options.originalName,
      mimeType: options.mimeType,
      size: options.size,
      url: uploadResult.url,
      bucket: uploadResult.bucket,
      key: uploadResult.key,
      entityType: options.entityType,
      entityId: options.entityId,
      uploadedBy: options.uploadedBy,
      createdAt: new Date()
    })

    // Save to database
    await this.fileRepository.save(fileEntity)

    return fileEntity
  }

  /**
   * Delete a file from both cloud storage and database
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = await this.fileRepository.findById({ toString: () => fileId } as any)

    if (!file) {
      throw new Error(`File with id ${fileId} not found`)
    }

    const dto = file.toDto()

    // Delete from cloud storage
    await this.storageService.delete(dto.key)

    // Delete from database
    await this.fileRepository.delete({ toString: () => fileId } as any)
  }

  /**
   * Delete all files for a specific entity
   */
  async deleteEntityFiles(entityType: string, entityId: string): Promise<void> {
    const files = await this.fileRepository.findByEntity(entityType, entityId)

    // Delete from cloud storage
    for (const file of files) {
      const dto = file.toDto()
      await this.storageService.delete(dto.key)
    }

    // Delete from database
    await this.fileRepository.deleteByEntity(entityType, entityId)
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    const file = await this.fileRepository.findById({ toString: () => fileId } as any)

    if (!file) {
      throw new Error(`File with id ${fileId} not found`)
    }

    const dto = file.toDto()
    return this.storageService.getSignedUrl(dto.key, expiresIn)
  }

  /**
   * Check if file exists in cloud storage
   */
  async fileExists(fileId: string): Promise<boolean> {
    const file = await this.fileRepository.findById({ toString: () => fileId } as any)

    if (!file) {
      return false
    }

    const dto = file.toDto()
    return this.storageService.exists(dto.key)
  }
}
