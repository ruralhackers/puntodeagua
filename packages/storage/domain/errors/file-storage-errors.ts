export class FileStorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileStorageError'
  }
}

export class FileUploadError extends FileStorageError {
  constructor(message: string) {
    super(`File upload failed: ${message}`)
    this.name = 'FileUploadError'
  }
}

export class FileDeleteError extends FileStorageError {
  constructor(message: string) {
    super(`File delete failed: ${message}`)
    this.name = 'FileDeleteError'
  }
}

export class InvalidFileTypeError extends FileStorageError {
  constructor(fileType: string) {
    super(`Invalid file type: ${fileType}. Only image files are allowed.`)
    this.name = 'InvalidFileTypeError'
  }
}

export class FileSizeExceededError extends FileStorageError {
  constructor(fileSize: number, maxSize: number) {
    super(`File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes.`)
    this.name = 'FileSizeExceededError'
  }
}

export class FileNotFoundError extends FileStorageError {
  constructor(externalKey: string) {
    super(`File not found with external key: ${externalKey}`)
    this.name = 'FileNotFoundError'
  }
}
