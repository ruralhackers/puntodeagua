import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import {
  FileMetadata,
  FileSizeExceededError,
  type FileStorageRepository,
  FileUploadError,
  FileUploadResult,
  InvalidFileTypeError,
  MAX_FILE_SIZE,
  VALID_IMAGE_TYPES
} from '@pda/storage'
import { FileUploaderService } from '../application/file-uploader.service'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'
import {
  createMockFileStorageRepository,
  createMockWaterMeterReadingImageRepository
} from './helpers/mocks'

describe('FileUploaderService', () => {
  let service: FileUploaderService
  let mockFileStorageRepository: FileStorageRepository
  let mockWaterMeterReadingImageRepository: WaterMeterReadingImageRepository

  const defaultWaterMeterReadingId = Id.generateUniqueId()
  const defaultFileBuffer = Buffer.from('fake-image-data')
  const defaultFileMetadata = FileMetadata.create({
    fileName: 'test-image.jpg',
    fileSize: 1024 * 100, // 100KB
    mimeType: 'image/jpeg',
    originalName: 'water-meter-photo.jpg'
  })

  beforeEach(() => {
    mockFileStorageRepository = createMockFileStorageRepository()
    mockWaterMeterReadingImageRepository = createMockWaterMeterReadingImageRepository()

    service = new FileUploaderService(
      mockFileStorageRepository,
      mockWaterMeterReadingImageRepository
    )
  })

  it('should upload image successfully with valid data', async () => {
    // Arrange
    const expectedUrl = 'https://r2.example.com/water-meter-readings/123/test-image.jpg'
    const uploadResult = FileUploadResult.create({
      url: expectedUrl,
      externalKey: 'water-meter-readings/123/test-image.jpg',
      metadata: defaultFileMetadata
    })

    mockFileStorageRepository.upload = mock().mockResolvedValue(uploadResult)
    mockWaterMeterReadingImageRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.uploadWaterMeterReadingImage({
      file: defaultFileBuffer,
      waterMeterReadingId: defaultWaterMeterReadingId,
      metadata: defaultFileMetadata
    })

    // Assert
    expect(result).toBe(expectedUrl)
    expect(mockFileStorageRepository.upload).toHaveBeenCalledWith(
      defaultFileBuffer,
      defaultFileMetadata,
      defaultWaterMeterReadingId.toString(),
      'water-meter-readings'
    )
    expect(mockWaterMeterReadingImageRepository.save).toHaveBeenCalled()
  })

  it('should throw InvalidFileTypeError for invalid mime type', async () => {
    // Arrange
    const invalidMetadata = FileMetadata.create({
      fileName: 'test-file.txt',
      fileSize: 1024,
      mimeType: 'text/plain',
      originalName: 'document.txt'
    })

    // Act & Assert
    await expect(
      service.uploadWaterMeterReadingImage({
        file: defaultFileBuffer,
        waterMeterReadingId: defaultWaterMeterReadingId,
        metadata: invalidMetadata
      })
    ).rejects.toThrow(InvalidFileTypeError)

    // Verify that upload was never called
    expect(mockFileStorageRepository.upload).not.toHaveBeenCalled()
  })

  it('should throw FileSizeExceededError for file too large', async () => {
    // Arrange
    const largeFileMetadata = FileMetadata.create({
      fileName: 'large-image.jpg',
      fileSize: MAX_FILE_SIZE + 1, // Exceeds limit
      mimeType: 'image/jpeg',
      originalName: 'large-photo.jpg'
    })

    // Act & Assert
    await expect(
      service.uploadWaterMeterReadingImage({
        file: defaultFileBuffer,
        waterMeterReadingId: defaultWaterMeterReadingId,
        metadata: largeFileMetadata
      })
    ).rejects.toThrow(FileSizeExceededError)

    // Verify that upload was never called
    expect(mockFileStorageRepository.upload).not.toHaveBeenCalled()
  })

  it('should throw FileUploadError when storage fails', async () => {
    // Arrange
    mockFileStorageRepository.upload = mock().mockRejectedValue(
      new FileUploadError('S3 connection failed')
    )

    // Act & Assert
    await expect(
      service.uploadWaterMeterReadingImage({
        file: defaultFileBuffer,
        waterMeterReadingId: defaultWaterMeterReadingId,
        metadata: defaultFileMetadata
      })
    ).rejects.toThrow(FileUploadError)

    // Verify repository save was never called
    expect(mockWaterMeterReadingImageRepository.save).not.toHaveBeenCalled()
  })

  it('should save image metadata to repository after upload', async () => {
    // Arrange
    const expectedUrl = 'https://r2.example.com/water-meter-readings/456/test.jpg'
    const uploadResult = FileUploadResult.create({
      url: expectedUrl,
      externalKey: 'water-meter-readings/456/test.jpg',
      metadata: defaultFileMetadata
    })

    mockFileStorageRepository.upload = mock().mockResolvedValue(uploadResult)
    mockWaterMeterReadingImageRepository.save = mock().mockResolvedValue(undefined)

    // Act
    await service.uploadWaterMeterReadingImage({
      file: defaultFileBuffer,
      waterMeterReadingId: defaultWaterMeterReadingId,
      metadata: defaultFileMetadata
    })

    // Assert - verify save was called with correct data
    expect(mockWaterMeterReadingImageRepository.save).toHaveBeenCalledTimes(1)
    const savedImage = (mockWaterMeterReadingImageRepository.save as any).mock.calls[0][0]
    expect(savedImage.waterMeterReadingId.toString()).toBe(defaultWaterMeterReadingId.toString())
    expect(savedImage.url).toBe(expectedUrl)
    expect(savedImage.fileName).toBe(defaultFileMetadata.fileName)
    expect(savedImage.fileSize).toBe(defaultFileMetadata.fileSize)
    expect(savedImage.mimeType).toBe(defaultFileMetadata.mimeType)
    expect(savedImage.externalKey).toBe('water-meter-readings/456/test.jpg')
  })

  it('should validate file before uploading', async () => {
    // Arrange
    const invalidMetadata = FileMetadata.create({
      fileName: 'test.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      originalName: 'document.pdf'
    })

    // Act & Assert
    await expect(
      service.uploadWaterMeterReadingImage({
        file: defaultFileBuffer,
        waterMeterReadingId: defaultWaterMeterReadingId,
        metadata: invalidMetadata
      })
    ).rejects.toThrow(InvalidFileTypeError)

    // Verify that neither upload nor save were called
    expect(mockFileStorageRepository.upload).not.toHaveBeenCalled()
    expect(mockWaterMeterReadingImageRepository.save).not.toHaveBeenCalled()
  })

  it('should accept all valid image types', async () => {
    // Arrange
    const uploadResult = FileUploadResult.create({
      url: 'https://r2.example.com/image.jpg',
      externalKey: 'water-meter-readings/123/image.jpg',
      metadata: defaultFileMetadata
    })

    mockFileStorageRepository.upload = mock().mockResolvedValue(uploadResult)
    mockWaterMeterReadingImageRepository.save = mock().mockResolvedValue(undefined)

    // Act & Assert - test each valid type
    for (const mimeType of VALID_IMAGE_TYPES) {
      const metadata = FileMetadata.create({
        fileName: `test.${mimeType.split('/')[1]}`,
        fileSize: 1024 * 50,
        mimeType,
        originalName: `photo.${mimeType.split('/')[1]}`
      })

      const result = await service.uploadWaterMeterReadingImage({
        file: defaultFileBuffer,
        waterMeterReadingId: defaultWaterMeterReadingId,
        metadata
      })

      expect(result).toBeTruthy()
    }
  })

  it('should handle file at exact size limit', async () => {
    // Arrange
    const exactLimitMetadata = FileMetadata.create({
      fileName: 'exact-limit.jpg',
      fileSize: MAX_FILE_SIZE, // Exactly at limit
      mimeType: 'image/jpeg',
      originalName: 'exact-photo.jpg'
    })

    const uploadResult = FileUploadResult.create({
      url: 'https://r2.example.com/exact.jpg',
      externalKey: 'water-meter-readings/123/exact.jpg',
      metadata: exactLimitMetadata
    })

    mockFileStorageRepository.upload = mock().mockResolvedValue(uploadResult)
    mockWaterMeterReadingImageRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.uploadWaterMeterReadingImage({
      file: defaultFileBuffer,
      waterMeterReadingId: defaultWaterMeterReadingId,
      metadata: exactLimitMetadata
    })

    // Assert
    expect(result).toBeTruthy()
    expect(mockFileStorageRepository.upload).toHaveBeenCalled()
  })
})
