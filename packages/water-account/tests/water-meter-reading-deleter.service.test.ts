import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { ImageEntityType } from '@pda/storage'
import type { FileDeleterService } from '../application/file-deleter.service'
import type { WaterMeterLastReadingUpdater } from '../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingDeleter } from '../application/water-meter-reading-deleter.service'
import { WaterMeter, WaterMeterReading } from '../domain'
import { WaterMeterReadingImage } from '../domain/entities/water-meter-reading-image'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'
import {
  createMockFileDeleterService,
  createMockWaterMeterLastReadingUpdater,
  createMockWaterMeterReadingImageRepository,
  createMockWaterMeterReadingRepository,
  createMockWaterMeterRepository
} from './helpers/mocks'

describe('WaterMeterReadingDeleter', () => {
  let service: WaterMeterReadingDeleter
  let serviceWithImageSupport: WaterMeterReadingDeleter
  let mockWaterMeterReadingRepository: WaterMeterReadingRepository
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterMeterLastReadingUpdater: WaterMeterLastReadingUpdater
  let mockWaterMeterReadingImageRepository: WaterMeterReadingImageRepository
  let mockFileDeleterService: FileDeleterService

  // Default test entities
  const defaultWaterPoint = {
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Point',
    location: 'Test Location',
    fixedPopulation: 4,
    floatingPopulation: 2,
    cadastralReference: 'TEST-001',
    communityZoneId: Id.generateUniqueId().toString(),
    waterDepositIds: [],
    notes: 'Test water point'
  }

  const defaultWaterMeter = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter',
    waterAccountId: Id.generateUniqueId().toString(),
    measurementUnit: 'L',
    lastReadingNormalizedValue: 10000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: false,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  const defaultLastReading = WaterMeterReading.fromDto({
    id: Id.generateUniqueId().toString(),
    waterMeterId: defaultWaterMeter.id.toString(),
    reading: '10000',
    normalizedReading: 10000,
    readingDate: new Date(),
    notes: 'Last reading'
  })

  const defaultPreviousReading = WaterMeterReading.fromDto({
    id: Id.generateUniqueId().toString(),
    waterMeterId: defaultWaterMeter.id.toString(),
    reading: '5000',
    normalizedReading: 5000,
    readingDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
    notes: 'Previous reading'
  })

  beforeEach(() => {
    mockWaterMeterReadingRepository = createMockWaterMeterReadingRepository()
    mockWaterMeterRepository = createMockWaterMeterRepository()
    mockWaterMeterLastReadingUpdater = createMockWaterMeterLastReadingUpdater()
    mockWaterMeterReadingImageRepository = createMockWaterMeterReadingImageRepository()
    mockFileDeleterService = createMockFileDeleterService()

    service = new WaterMeterReadingDeleter(
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository,
      mockWaterMeterLastReadingUpdater
    )

    serviceWithImageSupport = new WaterMeterReadingDeleter(
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository,
      mockWaterMeterLastReadingUpdater,
      mockWaterMeterReadingImageRepository,
      mockFileDeleterService
    )
  })

  it('should delete reading successfully when it is the last reading', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await service.run(readingId)

    // Assert
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(defaultLastReading.waterMeterId)
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalledWith(
      defaultLastReading.waterMeterId
    )
    expect(mockWaterMeterReadingRepository.delete).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterReadingRepository.findLastReadingsForWaterMeter).toHaveBeenCalledWith(
      defaultLastReading.waterMeterId,
      2
    )
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(defaultWaterMeter, [
      defaultPreviousReading
    ])
  })

  it('should throw error when reading is not the last reading', async () => {
    // Arrange
    const oldReadingId = defaultPreviousReading.id
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultPreviousReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)

    // Act & Assert
    await expect(service.run(oldReadingId)).rejects.toThrow(
      'Can only delete the most recent reading'
    )

    // Verify deletion was not attempted
    expect(mockWaterMeterReadingRepository.delete).not.toHaveBeenCalled()
  })

  it('should update water meter with previous readings after deletion', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    const secondLastReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '3000',
      normalizedReading: 3000,
      readingDate: new Date(Date.now() - 86400000 * 60), // 60 days ago
      notes: 'Second last reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading,
      secondLastReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await service.run(readingId)

    // Assert
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(defaultWaterMeter, [
      defaultPreviousReading,
      secondLastReading
    ])
  })

  it('should update water meter with null values when no more readings exist', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([])
    mockWaterMeterRepository.save = mock().mockResolvedValue(undefined)

    // Act
    await service.run(readingId)

    // Assert
    expect(mockWaterMeterReadingRepository.delete).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterLastReadingUpdater.run).not.toHaveBeenCalled()
    expect(mockWaterMeterRepository.save).toHaveBeenCalledWith(defaultWaterMeter)
    // Verify water meter was updated with null values
    expect(defaultWaterMeter.lastReadingNormalizedValue).toBeNull()
    expect(defaultWaterMeter.lastReadingDate).toBeNull()
    expect(defaultWaterMeter.lastReadingExcessConsumption).toBeNull()
  })

  it('should delete associated image if it exists', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    const image = WaterMeterReadingImage.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterReadingId: readingId.toString(),
      url: 'https://r2.example.com/image.jpg',
      fileName: 'image.jpg',
      fileSize: 1024 * 100,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
      externalKey: 'water-meter-readings/123/image.jpg'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingImageRepository.findByWaterMeterReadingId = mock().mockResolvedValue(image)
    mockFileDeleterService.run = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await serviceWithImageSupport.run(readingId)

    // Assert
    expect(mockWaterMeterReadingImageRepository.findByWaterMeterReadingId).toHaveBeenCalledWith(
      readingId
    )
    expect(mockFileDeleterService.run).toHaveBeenCalledWith({
      fileId: image.id,
      entityType: ImageEntityType.WATER_METER_READING
    })
  })

  it('should not fail when no associated image exists', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingImageRepository.findByWaterMeterReadingId = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await serviceWithImageSupport.run(readingId)

    // Assert
    expect(mockWaterMeterReadingImageRepository.findByWaterMeterReadingId).toHaveBeenCalledWith(
      readingId
    )
    expect(mockFileDeleterService.run).not.toHaveBeenCalled()
    expect(mockWaterMeterReadingRepository.delete).toHaveBeenCalledWith(readingId)
  })

  it('should continue with reading deletion when image deletion fails', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    const image = WaterMeterReadingImage.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterReadingId: readingId.toString(),
      url: 'https://r2.example.com/image.jpg',
      fileName: 'image.jpg',
      fileSize: 1024 * 100,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
      externalKey: 'water-meter-readings/123/image.jpg'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingImageRepository.findByWaterMeterReadingId = mock().mockResolvedValue(image)
    mockFileDeleterService.run = mock().mockRejectedValue(new Error('Storage service unavailable'))
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await serviceWithImageSupport.run(readingId)

    // Assert - reading should still be deleted despite image deletion failure
    expect(mockFileDeleterService.run).toHaveBeenCalled()
    expect(mockWaterMeterReadingRepository.delete).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
  })

  it('should throw error when reading does not exist', async () => {
    // Arrange
    const nonExistentId = Id.generateUniqueId()
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run(nonExistentId)).rejects.toThrow('Water meter reading not found')

    // Verify no other operations were attempted
    expect(mockWaterMeterRepository.findById).not.toHaveBeenCalled()
    expect(mockWaterMeterReadingRepository.delete).not.toHaveBeenCalled()
  })

  it('should throw error when water meter does not exist', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run(readingId)).rejects.toThrow('Water meter not found')

    // Verify deletion was not attempted
    expect(mockWaterMeterReadingRepository.delete).not.toHaveBeenCalled()
  })

  it('should verify order of operations: image deletion, reading deletion, water meter update', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    const image = WaterMeterReadingImage.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterReadingId: readingId.toString(),
      url: 'https://r2.example.com/image.jpg',
      fileName: 'image.jpg',
      fileSize: 1024 * 100,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
      externalKey: 'water-meter-readings/123/image.jpg'
    })

    const operationOrder: string[] = []

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingImageRepository.findByWaterMeterReadingId = mock().mockResolvedValue(image)
    mockFileDeleterService.run = mock().mockImplementation(async () => {
      operationOrder.push('image-deletion')
      return Promise.resolve(undefined)
    })
    mockWaterMeterReadingRepository.delete = mock().mockImplementation(async () => {
      operationOrder.push('reading-deletion')
      return Promise.resolve(undefined)
    })
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockImplementation(async () => {
      operationOrder.push('water-meter-update')
      return Promise.resolve(defaultWaterMeter)
    })

    // Act
    await serviceWithImageSupport.run(readingId)

    // Assert - verify correct order
    expect(operationOrder).toEqual(['image-deletion', 'reading-deletion', 'water-meter-update'])
  })

  it('should delete reading without calling image repository when image support is not configured', async () => {
    // Arrange
    const readingId = defaultLastReading.id
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)
    mockWaterMeterReadingRepository.delete = mock().mockResolvedValue(undefined)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      defaultPreviousReading
    ])
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await service.run(readingId)

    // Assert - image repository should not be called
    expect(mockWaterMeterReadingImageRepository.findByWaterMeterReadingId).not.toHaveBeenCalled()
    expect(mockFileDeleterService.run).not.toHaveBeenCalled()
    expect(mockWaterMeterReadingRepository.delete).toHaveBeenCalledWith(readingId)
  })
})
