import type { FileMetadata } from '../value-objects/file-metadata'
import type { FileUploadResult } from '../value-objects/file-upload-result'

export interface FileStorageRepository {
  /**
   * Uploads a file to the storage provider
   * @param file - The file buffer to upload
   * @param metadata - File metadata (name, size, type, etc.)
   * @param entityId - The entity ID to associate the file with
   * @param entityType - The type of entity (e.g., 'water-meter-readings')
   * @returns Promise<FileUploadResult> - The upload result with URL and external key
   */
  upload(
    file: Buffer,
    metadata: FileMetadata,
    entityId: string,
    entityType: string
  ): Promise<FileUploadResult>

  /**
   * Deletes a file from the storage provider
   * @param externalKey - The external key of the file to delete
   * @returns Promise<void>
   */
  delete(externalKey: string): Promise<void>

  /**
   * Gets the public URL for a file
   * @param externalKey - The external key of the file
   * @returns Promise<string> - The public URL of the file
   */
  getUrl(externalKey: string): Promise<string>

  /**
   * Checks if a file exists in the storage provider
   * @param externalKey - The external key of the file
   * @returns Promise<boolean> - True if the file exists, false otherwise
   */
  exists(externalKey: string): Promise<boolean>
}
