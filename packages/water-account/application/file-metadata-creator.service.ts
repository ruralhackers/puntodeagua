import { DEFAULT_FILE_EXTENSION, FileMetadata } from '@pda/storage'

export class FileMetadataCreatorService {
  static createFileMetadata(params: {
    originalName: string
    fileSize: number
    mimeType: string
  }): FileMetadata {
    const { originalName, fileSize, mimeType } = params

    // Generate unique filename
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()?.toLowerCase() || DEFAULT_FILE_EXTENSION
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    return FileMetadata.create({
      fileName,
      fileSize,
      mimeType,
      originalName
    })
  }
}

