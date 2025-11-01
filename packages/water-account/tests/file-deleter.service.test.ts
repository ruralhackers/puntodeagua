import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { FileStorageRepository } from '@pda/storage'
import { FileDeleterService } from '../application/file-deleter.service'
import { WaterMeterReadingImage } from '../domain/entities/water-meter-reading-image'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'
import {
  createMockFileStorageRepository,
  createMockWaterMeterReadingImageRepository
} from './helpers/mocks'

describe('FileDeleterService', () => {
  let service: FileDeleterService
  let mockFileStorageRepository: FileStorageRepository
  let mockWaterMeterReadingImageRepository: WaterMeterReadingImageRepository

  const defaultImageId = Id.generateUniqueId()
  const defaultImage = WaterMeterReadingImage.fromDto({
    id: defaultImageId.toString(),
    waterMeterReadingId: Id.generateUniqueId().toString(),
    url: 'https://r2.example.com/water-meter-readings/123/image.jpg',
    fileName: 'image.jpg',
    fileSize: 1024 * 100,
    mimeType: 'image/jpeg',
    uploadedAt: new Date(),
    externalKey: 'water-meter-readings/123/image.jpg'
  })

  beforeEach(() => {
    mockFileStorageRepository = createMockFileStorageRepository()
    mockWaterMeterReadingImageRepository = createMockWaterMeterReadingImageRepository()

    service = new FileDeleterService(
      mockFileStorageRepository,
      mockWaterMeterReadingImageRepository
    )
  })

  it('should delete image from storage and database successfully', async () => {
    // Arrange
    mockWaterMeterReadingImageRepository.findById = mock().mockResolvedValue(defaultImage)
    mockFileStorageRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingImageRepository.delete = mock().mockResolvedValue(undefined)

    // Act
    await service.deleteWaterMeterReadingImage(defaultImageId)

    // Assert
    expect(mockWaterMeterReadingImageRepository.findById).toHaveBeenCalledWith(defaultImageId)
    expect(mockFileStorageRepository.delete).toHaveBeenCalledWith(defaultImage.externalKey)
    expect(mockWaterMeterReadingImageRepository.delete).toHaveBeenCalledWith(defaultImageId)
  })

  it('should not throw error when image does not exist', async () => {
    // Arrange
    mockWaterMeterReadingImageRepository.findById = mock().mockResolvedValue(undefined)

    // Act
    await service.deleteWaterMeterReadingImage(defaultImageId)

    // Assert - should complete without error
    expect(mockFileStorageRepository.delete).not.toHaveBeenCalled()
    expect(mockWaterMeterReadingImageRepository.delete).not.toHaveBeenCalled()
  })

  it('should delete from storage before deleting from database', async () => {
    // Arrange
    const callOrder: string[] = []

    mockWaterMeterReadingImageRepository.findById = mock().mockResolvedValue(defaultImage)
    mockFileStorageRepository.delete = mock().mockImplementation(async () => {
      callOrder.push('storage')
      return Promise.resolve(undefined)
    })
    mockWaterMeterReadingImageRepository.delete = mock().mockImplementation(async () => {
      callOrder.push('database')
      return Promise.resolve(undefined)
    })

    // Act
    await service.deleteWaterMeterReadingImage(defaultImageId)

    // Assert
    expect(callOrder).toEqual(['storage', 'database'])
  })

  it('should handle storage deletion failure gracefully', async () => {
    // Arrange
    mockWaterMeterReadingImageRepository.findById = mock().mockResolvedValue(defaultImage)
    mockFileStorageRepository.delete = mock().mockRejectedValue(
      new Error('Storage service unavailable')
    )

    // Act & Assert - should propagate error
    await expect(service.deleteWaterMeterReadingImage(defaultImageId)).rejects.toThrow(
      'Storage service unavailable'
    )

    // Verify that database delete was not called after storage failure
    expect(mockWaterMeterReadingImageRepository.delete).not.toHaveBeenCalled()
  })

  it('should handle database deletion failure', async () => {
    // Arrange
    mockWaterMeterReadingImageRepository.findById = mock().mockResolvedValue(defaultImage)
    mockFileStorageRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingImageRepository.delete = mock().mockRejectedValue(
      new Error('Database error')
    )

    // Act & Assert - should propagate error
    await expect(service.deleteWaterMeterReadingImage(defaultImageId)).rejects.toThrow(
      'Database error'
    )

    // Verify that storage delete was called (since it comes first)
    expect(mockFileStorageRepository.delete).toHaveBeenCalled()
  })

  it('should handle multiple image deletions sequentially', async () => {
    // Arrange
    const imageId1 = Id.generateUniqueId()
    const imageId2 = Id.generateUniqueId()

    const image1 = WaterMeterReadingImage.fromDto({
      ...defaultImage.toDto(),
      id: imageId1.toString(),
      externalKey: 'water-meter-readings/123/image1.jpg'
    })

    const image2 = WaterMeterReadingImage.fromDto({
      ...defaultImage.toDto(),
      id: imageId2.toString(),
      externalKey: 'water-meter-readings/123/image2.jpg'
    })

    mockWaterMeterReadingImageRepository.findById = mock()
      .mockResolvedValueOnce(image1)
      .mockResolvedValueOnce(image2)
    mockFileStorageRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingImageRepository.delete = mock().mockResolvedValue(undefined)

    // Act
    await service.deleteWaterMeterReadingImage(imageId1)
    await service.deleteWaterMeterReadingImage(imageId2)

    // Assert
    expect(mockFileStorageRepository.delete).toHaveBeenCalledTimes(2)
    expect(mockFileStorageRepository.delete).toHaveBeenCalledWith(image1.externalKey)
    expect(mockFileStorageRepository.delete).toHaveBeenCalledWith(image2.externalKey)
  })

  it('should return early when image not found without calling delete operations', async () => {
    // Arrange
    mockWaterMeterReadingImageRepository.findById = mock().mockResolvedValue(undefined)
    mockFileStorageRepository.delete = mock()
    mockWaterMeterReadingImageRepository.delete = mock()

    // Act
    await service.deleteWaterMeterReadingImage(defaultImageId)

    // Assert
    expect(mockWaterMeterReadingImageRepository.findById).toHaveBeenCalledWith(defaultImageId)
    expect(mockFileStorageRepository.delete).not.toHaveBeenCalled()
    expect(mockWaterMeterReadingImageRepository.delete).not.toHaveBeenCalled()
  })
})
