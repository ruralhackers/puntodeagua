export interface StorageConfig {
  bucketName: string
  publicUrl: string
}

export interface StorageMetadata {
  originalName: string
  entityType: string
  entityId: string
  uploadedBy: string
  uploadedAt: string
}

export interface FileInfo {
  key: string
  size: number
  mimeType: string
  metadata: StorageMetadata
  lastModified: Date
}

export type StorageProvider = 'r2' | 's3' | 'local'

export interface StorageHealth {
  provider: StorageProvider
  status: 'healthy' | 'unhealthy' | 'unknown'
  message?: string
  lastCheck: Date
}
