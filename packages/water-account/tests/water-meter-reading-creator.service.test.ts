import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { FileMetadata } from '@pda/storage'
import type { FileUploaderService } from '../application/file-uploader.service'
import type { WaterMeterLastReadingUpdater } from '../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingCreator } from '../application/water-meter-reading-creator.service'
import { WaterMeter, WaterMeterReading } from '../domain'
import { WaterMeterReadingDateNotAllowedError } from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import {
  createMockFileUploaderService,
  createMockWaterMeterLastReadingUpdater,
  createMockWaterMeterReadingRepository,
  createMockWaterMeterRepository
} from './helpers/mocks'

describe('WaterMeterReadingCreator', () => {
  let service: WaterMeterReadingCreator
  let serviceWithImageSupport: WaterMeterReadingCreator
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterMeterReadingRepository: WaterMeterReadingRepository
  let mockWaterMeterLastReadingUpdater: WaterMeterLastReadingUpdater
  let mockFileUploaderService: FileUploaderService

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

  const defaultWaterMeterLiters = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter (L)',
    waterAccountId: Id.generateUniqueId().toString(),
    measurementUnit: 'L',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: true,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  const defaultWaterMeterCubicMeters = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter (M3)',
    waterAccountId: Id.generateUniqueId().toString(),
    measurementUnit: 'M3',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: true,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  const defaultLastReading = WaterMeterReading.fromDto({
    id: Id.generateUniqueId().toString(),
    waterMeterId: defaultWaterMeterLiters.id.toString(),
    reading: '5000',
    normalizedReading: 5000,
    readingDate: new Date(Date.now() - 86400000), // 1 day ago
    notes: 'Previous reading'
  })

  beforeEach(() => {
    mockWaterMeterRepository = createMockWaterMeterRepository()
    mockWaterMeterReadingRepository = createMockWaterMeterReadingRepository()
    mockWaterMeterLastReadingUpdater = createMockWaterMeterLastReadingUpdater()
    mockFileUploaderService = createMockFileUploaderService()

    service = new WaterMeterReadingCreator(
      mockWaterMeterLastReadingUpdater,
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository
    )

    serviceWithImageSupport = new WaterMeterReadingCreator(
      mockWaterMeterLastReadingUpdater,
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository,
      mockFileUploaderService
    )
  })

  it('should throw error if provided date is in the future', async () => {
    // Arrange
    const futureDate = new Date(Date.now() + 86400000) // 1 day in the future
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeterLiters)

    // Act & Assert
    await expect(
      service.run({ waterMeterId: Id.generateUniqueId(), reading: '1000', date: futureDate })
    ).rejects.toThrow(WaterMeterReadingDateNotAllowedError)

    // Verify repository call
    expect(mockWaterMeterRepository.findById).toHaveBeenCalled()
  })

  it('should throw error if water meter not found', async () => {
    // Arrange
    mockWaterMeterRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(
      service.run({ waterMeterId: Id.generateUniqueId(), reading: '1000' })
    ).rejects.toThrow('Water meter not found')

    // Verify repository call
    expect(mockWaterMeterRepository.findById).toHaveBeenCalled()
  })

  it('should throw error if new reading is lower than last reading', async () => {
    // Arrange
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeterLiters)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)

    // Act & Assert
    await expect(
      service.run({ waterMeterId: defaultWaterMeterLiters.id, reading: '1000' })
    ).rejects.toThrow('New reading is lower than last reading')

    // Verify repository call
    expect(mockWaterMeterRepository.findById).toHaveBeenCalled()
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalled()
  })

  it('should create reading with liters measurement unit and normalize correctly', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterLiters
    const reading = '15000' // 15k liters

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading,
      notes: 'Test reading'
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.waterMeterId.toString()).toBe(waterMeter.id.toString())
    expect(result.reading.reading.toString()).toBe(reading)
    expect(result.reading.normalizedReading).toBe(
      waterMeter.measurementUnit.normalize(result.reading.reading)
    )
    expect(result.reading.notes).toBe('Test reading')
    expect(result.reading.readingDate).toBeInstanceOf(Date)

    // Verify repository calls
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(result.reading)
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [result.reading])
  })

  it('should create reading with cubic meters measurement unit and normalize correctly', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterCubicMeters
    const reading = '15' // 15 cubic meters

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading,
      notes: 'Test reading M3'
    })

    // Assert
    expect(result.reading.normalizedReading).toBe(
      waterMeter.measurementUnit.normalize(result.reading.reading)
    )
    expect(result.reading.normalizedReading).toBe(15000)

    // Verify repository calls
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(result.reading)
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [result.reading])
  })

  it('should create reading with existing last reading', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterLiters
    const lastReading = defaultLastReading
    const reading = '20000'

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading,
      notes: 'New reading with last reading'
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe(reading)
    expect(result.reading.normalizedReading).toBe(
      waterMeter.measurementUnit.normalize(result.reading.reading)
    )

    // Verify that both last reading and new reading are passed to updater
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [
      lastReading,
      result.reading
    ])
  })

  it('should create reading without existing last reading', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterLiters
    const reading = '10000'

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe(reading)
    expect(result.reading.notes).toBeNull()

    // Verify that only new reading is passed to updater
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [result.reading])
  })

  describe('Image upload integration', () => {
    it('should create reading without image when image support is not configured', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const reading = '15000'

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

      // Act
      const result = await service.run({
        waterMeterId: waterMeter.id,
        reading,
        notes: 'Reading without image'
      })

      // Assert
      expect(result.reading).toBeInstanceOf(WaterMeterReading)
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalled()
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
    })

    it('should create reading and upload image when image is provided', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const reading = '15000'
      const imageBuffer = Buffer.from('fake-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'test-image.jpg',
        fileSize: 1024 * 100, // 100KB
        mimeType: 'image/jpeg',
        originalName: 'water-meter-photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)
      mockFileUploaderService.run = mock().mockResolvedValue(
        'https://r2.example.com/water-meter-readings/123/test-image.jpg'
      )

      // Act
      const result = await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        notes: 'Reading with image',
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(result.reading).toBeInstanceOf(WaterMeterReading)
      expect(result.reading.reading.toString()).toBe(reading)
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(result.reading)
      expect(mockFileUploaderService.run).toHaveBeenCalledWith({
        file: imageBuffer,
        entityId: result.reading.id,
        entityType: expect.anything(),
        metadata: imageMetadata
      })
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [
        result.reading
      ])
    })

    it('should create reading without calling image uploader when image is not provided', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const reading = '15000'

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

      // Act
      const result = await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        notes: 'Reading without image'
      })

      // Assert
      expect(result.reading).toBeInstanceOf(WaterMeterReading)
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalled()
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
    })

    it('should save reading first and then upload image', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const reading = '15000'
      const imageBuffer = Buffer.from('fake-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'test-image.jpg',
        fileSize: 1024 * 50,
        mimeType: 'image/jpeg',
        originalName: 'meter-photo.jpg'
      })

      let readingSavedBeforeImageUpload = false
      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
      mockWaterMeterReadingRepository.save = mock().mockImplementation(() => {
        readingSavedBeforeImageUpload = true
        return Promise.resolve(undefined)
      })
      mockFileUploaderService.run = mock().mockImplementation(() => {
        expect(readingSavedBeforeImageUpload).toBe(true)
        return Promise.resolve('https://r2.example.com/image.jpg')
      })
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

      // Act
      await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalled()
      expect(mockFileUploaderService.run).toHaveBeenCalled()
    })

    it('should create reading with image even when there is a last reading', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const lastReading = defaultLastReading
      const reading = '20000'
      const imageBuffer = Buffer.from('fake-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'new-reading.jpg',
        fileSize: 1024 * 200,
        mimeType: 'image/jpeg',
        originalName: 'water-meter-new.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)
      mockFileUploaderService.run = mock().mockResolvedValue('https://r2.example.com/image.jpg')

      // Act
      const result = await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(result.reading).toBeInstanceOf(WaterMeterReading)
      expect(mockFileUploaderService.run).toHaveBeenCalledWith({
        file: imageBuffer,
        entityId: result.reading.id,
        entityType: expect.anything(),
        metadata: imageMetadata
      })
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [
        lastReading,
        result.reading
      ])
    })

    it('should save reading even if image upload fails', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const reading = '15000'
      const imageBuffer = Buffer.from('fake-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'test-image.jpg',
        fileSize: 1024 * 100,
        mimeType: 'image/jpeg',
        originalName: 'water-meter-photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)
      mockFileUploaderService.run = mock().mockRejectedValue(
        new Error('Storage service unavailable')
      )

      // Act
      const result = await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        notes: 'Reading with failed image',
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(result.reading).toBeDefined()
      expect(result.imageUploadFailed).toBe(true)
      expect(result.imageError).toContain('Storage service unavailable')
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalled()
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
    })

    it('should return imageUploadFailed flag when upload fails', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const reading = '10000'
      const imageBuffer = Buffer.from('fake-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'test.jpg',
        fileSize: 1024 * 80,
        mimeType: 'image/jpeg',
        originalName: 'photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)
      mockFileUploaderService.run = mock().mockRejectedValue(new Error('Invalid file type'))

      // Act
      const result = await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(result.imageUploadFailed).toBe(true)
      expect(result.imageError).toBe('Invalid file type')
      expect(result.reading.reading.toString()).toBe(reading)
    })

    it('should continue with reading creation if FileUploadError occurs', async () => {
      // Arrange
      const waterMeter = defaultWaterMeterLiters
      const lastReading = defaultLastReading
      const reading = '20000'
      const imageBuffer = Buffer.from('fake-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'new-reading.jpg',
        fileSize: 1024 * 150,
        mimeType: 'image/jpeg',
        originalName: 'new-photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
      mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)
      mockFileUploaderService.run = mock().mockRejectedValue(new Error('Upload failed'))

      // Act
      const result = await serviceWithImageSupport.run({
        waterMeterId: waterMeter.id,
        reading,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert - reading should be created despite image failure
      expect(result.reading).toBeDefined()
      expect(result.reading.reading.toString()).toBe(reading)
      expect(result.imageUploadFailed).toBe(true)
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [
        lastReading,
        result.reading
      ])
    })
  })
})
