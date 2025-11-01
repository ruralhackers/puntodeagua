export class FileStorageError extends Error {
  constructor(message: string = FileStorageError.defaultMessage) {
    super(message)
    this.name = 'FileStorageError'
  }

  static defaultMessage = 'File Storage Error'
  static defaultMessageEs = 'Error de Almacenamiento de Archivos'
  static statusCode = 500
}

export class FileUploadError extends FileStorageError {
  constructor(message: string = FileUploadError.defaultMessage) {
    super(message)
    this.name = 'FileUploadError'
  }

  static override defaultMessage = 'File upload failed'
  static override defaultMessageEs = 'Error al subir el archivo'
  static override statusCode = 500
}

export class FileDeleteError extends FileStorageError {
  constructor(message: string = FileDeleteError.defaultMessage) {
    super(message)
    this.name = 'FileDeleteError'
  }

  static override defaultMessage = 'File delete failed'
  static override defaultMessageEs = 'Error al eliminar el archivo'
  static override statusCode = 500
}

export class InvalidFileTypeError extends FileStorageError {
  constructor(fileType?: string) {
    const message = fileType
      ? `${InvalidFileTypeError.defaultMessage}: ${fileType}`
      : InvalidFileTypeError.defaultMessage
    super(message)
    this.name = 'InvalidFileTypeError'
  }

  static override defaultMessage = 'Invalid file type. Only image files are allowed'
  static override defaultMessageEs = 'Formato no válido. Solo se permiten archivos JPG, PNG o WebP'
  static override statusCode = 400
}

export class FileSizeExceededError extends FileStorageError {
  constructor(fileSize?: number, maxSize?: number) {
    const message =
      fileSize && maxSize
        ? `File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
        : FileSizeExceededError.defaultMessage
    super(message)
    this.name = 'FileSizeExceededError'
  }

  static override defaultMessage = 'File size exceeds maximum allowed size'
  static override defaultMessageEs = 'La imagen es demasiado grande. Máximo 10MB'
  static override statusCode = 400
}

export class FileNotFoundError extends FileStorageError {
  constructor(externalKey?: string) {
    const message = externalKey
      ? `${FileNotFoundError.defaultMessage}: ${externalKey}`
      : FileNotFoundError.defaultMessage
    super(message)
    this.name = 'FileNotFoundError'
  }

  static override defaultMessage = 'File not found'
  static override defaultMessageEs = 'Archivo no encontrado'
  static override statusCode = 404
}
