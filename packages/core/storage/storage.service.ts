export interface UploadOptions {
  filename: string
  originalName: string
  mimeType: string
  size: number
  entityType: string
  entityId: string
  uploadedBy: string
}

export interface UploadResult {
  filename: string
  url: string
  bucket: string
  key: string
}

export interface StorageService {
  /**
   * Upload a file to the cloud storage
   */
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>

  /**
   * Delete a file from cloud storage
   */
  delete(key: string): Promise<void>

  /**
   * Get a signed URL for private file access (with expiration)
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>
}
