export interface FileDto {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  bucket: string
  key: string
  entityType: string
  entityId: string
  uploadedBy: string
  createdAt: Date
}
