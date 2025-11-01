import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { FileMetadata } from '@pda/storage'
import type { FileDeleterService } from '../application/file-deleter.service'
import type { FileUploaderService } from '../application/file-uploader.service'
import type { WaterMeterLastReadingUpdater } from '../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingUpdater } from '../application/water-meter-reading-updater.service'
import { WaterMeter, WaterMeterReading, WaterMeterReadingImage } from '../domain'
import {
  WaterMeterNotFoundError,
  WaterMeterReadingNotAllowedError,
  WaterMeterReadingNotLastError
} from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'
import {
  createMockFileDeleterService,
  createMockFileUploaderService,
  createMockWaterMeterLastReadingUpdater,
  createMockWaterMeterReadingImageRepository,
  createMockWaterMeterReadingRepository,
  createMockWaterMeterRepository
} from './helpers/mocks'

describe('WaterMeterReadingUpdater', () => {
  let service: WaterMeterReadingUpdater
  let serviceWithImageSupport: WaterMeterReadingUpdater
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterMeterReadingRepository: WaterMeterReadingRepository
  let mockWaterMeterLastReadingUpdater: WaterMeterLastReadingUpdater
  let mockWaterMeterReadingImageRepository: WaterMeterReadingImageRepository
  let mockFileUploaderService: FileUploaderService
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
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: true,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  const defaultReading = WaterMeterReading.fromDto({
    id: Id.generateUniqueId().toString(),
    waterMeterId: defaultWaterMeter.id.toString(),
    reading: '1000',
    normalizedReading: 1000,
    readingDate: new Date(),
    notes: 'Original notes'
  })

  beforeEach(() => {
    mockWaterMeterRepository = createMockWaterMeterRepository()
    mockWaterMeterReadingRepository = createMockWaterMeterReadingRepository()
    mockWaterMeterLastReadingUpdater = createMockWaterMeterLastReadingUpdater()
    mockWaterMeterReadingImageRepository = createMockWaterMeterReadingImageRepository()
    mockFileUploaderService = createMockFileUploaderService()
    mockFileDeleterService = createMockFileDeleterService()

    service = new WaterMeterReadingUpdater(
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository,
      mockWaterMeterLastReadingUpdater
    )

    serviceWithImageSupport = new WaterMeterReadingUpdater(
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository,
      mockWaterMeterLastReadingUpdater,
      mockWaterMeterReadingImageRepository,
      mockFileUploaderService,
      mockFileDeleterService
    )
  })

  it('should throw error when reading is not found', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(undefined)

    // Act & Assert
    await expect(service.run({ id: readingId, updatedData: { reading: '2000' } })).rejects.toThrow(
      'Water meter reading not found'
    )

    // Verify repository call
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(readingId)
  })

  it('should throw error when water meter is not found', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(defaultReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run({ id: readingId, updatedData: { reading: '2000' } })).rejects.toThrow(
      WaterMeterNotFoundError
    )

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(defaultReading.waterMeterId)
  })

  it('should throw error when reading is not one of the last two readings', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    const oldestReading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '500',
      normalizedReading: 500,
      readingDate: new Date(Date.now() - 172800000), // 2 days ago
      notes: 'Oldest reading'
    })
    const previousReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '750',
      normalizedReading: 750,
      readingDate: new Date(Date.now() - 86400000), // 1 day ago
      notes: 'Previous reading'
    })
    const lastReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(), // Today
      notes: 'Last reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(oldestReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      lastReading,
      previousReading
    ])

    // Act & Assert
    await expect(service.run({ id: readingId, updatedData: { reading: '2000' } })).rejects.toThrow(
      WaterMeterReadingNotLastError
    )

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(defaultWaterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReadingsForWaterMeter).toHaveBeenCalledWith(
      defaultWaterMeter.id,
      2
    )
  })

  it('should throw error when last reading is updated to be lower than previous reading', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    const currentReading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(),
      notes: 'Current reading'
    })
    const previousReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '500',
      normalizedReading: 500,
      readingDate: new Date(Date.now() - 86400000), // 1 day ago
      notes: 'Previous reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(currentReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      currentReading,
      previousReading
    ])

    // Act & Assert
    await expect(service.run({ id: readingId, updatedData: { reading: '300' } })).rejects.toThrow(
      WaterMeterReadingNotAllowedError
    )

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(defaultWaterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReadingsForWaterMeter).toHaveBeenCalledWith(
      defaultWaterMeter.id,
      2
    )
  })

  it('should update reading value and recalculate normalized reading', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    const reading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(),
      notes: 'Original notes'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([reading])
      .mockResolvedValueOnce([reading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    const result = await service.run({
      id: readingId,
      updatedData: { reading: '2000' }
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe('2000')
    expect(result.reading.normalizedReading).toBe(2000) // Should be recalculated
    expect(result.reading.notes).toBe('Original notes') // Should remain unchanged

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(readingId)
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(defaultWaterMeter.id)
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(expect.any(WaterMeterReading))
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      defaultWaterMeter,
      expect.any(Array)
    )
  })

  it('should update notes only', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    const reading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(),
      notes: 'Original notes'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([reading])
      .mockResolvedValueOnce([reading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    const result = await service.run({
      id: readingId,
      updatedData: { notes: 'Updated notes' }
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe('1000') // Should remain unchanged
    expect(result.reading.normalizedReading).toBe(1000) // Should remain unchanged
    expect(result.reading.notes).toBe('Updated notes') // Should be updated

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(expect.any(WaterMeterReading))
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      defaultWaterMeter,
      expect.any(Array)
    )
  })

  it('should update both reading and notes', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    const reading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(),
      notes: 'Original notes'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([reading])
      .mockResolvedValueOnce([reading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    const result = await service.run({
      id: readingId,
      updatedData: { reading: '3000', notes: 'Updated notes' }
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe('3000')
    expect(result.reading.normalizedReading).toBe(3000) // Should be recalculated
    expect(result.reading.notes).toBe('Updated notes')

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(expect.any(WaterMeterReading))
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      defaultWaterMeter,
      expect.any(Array)
    )
  })

  it('should handle cubic meters measurement unit correctly', async () => {
    // Arrange
    const waterMeterM3 = WaterMeter.fromDto({
      id: Id.generateUniqueId().toString(),
      name: 'Test Water Meter M3',
      waterAccountId: Id.generateUniqueId().toString(),
      measurementUnit: 'M3',
      lastReadingNormalizedValue: 1000,
      lastReadingDate: new Date(),
      lastReadingExcessConsumption: true,
      isActive: true,
      waterPoint: defaultWaterPoint
    })

    const readingId = Id.generateUniqueId()
    const reading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: waterMeterM3.id.toString(),
      reading: '1',
      normalizedReading: 1000, // 1 M3 = 1000 L
      readingDate: new Date(),
      notes: 'Original notes'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeterM3)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([reading])
      .mockResolvedValueOnce([reading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeterM3)

    // Act
    const result = await service.run({
      id: readingId,
      updatedData: { reading: '2' } // 2 M3
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe('2')
    expect(result.reading.normalizedReading).toBe(2000) // 2 M3 = 2000 L

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(expect.any(WaterMeterReading))
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      waterMeterM3,
      expect.any(Array)
    )
  })

  it('should always trigger lastReadingUpdater even when only notes change', async () => {
    // Arrange
    const readingId = Id.generateUniqueId()
    const reading = WaterMeterReading.fromDto({
      id: readingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(),
      notes: 'Original notes'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([reading])
      .mockResolvedValueOnce([reading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await service.run({
      id: readingId,
      updatedData: { notes: 'Updated notes' }
    })

    // Assert
    expect(mockWaterMeterReadingRepository.findLastReadingsForWaterMeter).toHaveBeenCalled()
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      defaultWaterMeter,
      expect.any(Array)
    )
  })

  // New tests for editing the previous reading
  it('should update the previous reading correctly', async () => {
    // Arrange
    const previousReadingId = Id.generateUniqueId()
    const previousReading = WaterMeterReading.fromDto({
      id: previousReadingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '500',
      normalizedReading: 500,
      readingDate: new Date(Date.now() - 86400000), // 1 day ago
      notes: 'Previous reading'
    })
    const lastReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(), // Today
      notes: 'Last reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(previousReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([lastReading, previousReading])
      .mockResolvedValueOnce([lastReading, previousReading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    const result = await service.run({
      id: previousReadingId,
      updatedData: { reading: '600' } // Update previous from 500 to 600
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe('600')
    expect(result.reading.normalizedReading).toBe(600)

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(expect.any(WaterMeterReading))
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      defaultWaterMeter,
      expect.any(Array)
    )
  })

  it('should throw error when previous reading is updated to be greater than last reading', async () => {
    // Arrange
    const previousReadingId = Id.generateUniqueId()
    const previousReading = WaterMeterReading.fromDto({
      id: previousReadingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '500',
      normalizedReading: 500,
      readingDate: new Date(Date.now() - 86400000), // 1 day ago
      notes: 'Previous reading'
    })
    const lastReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(), // Today
      notes: 'Last reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(previousReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock().mockResolvedValue([
      lastReading,
      previousReading
    ])

    // Act & Assert
    await expect(
      service.run({
        id: previousReadingId,
        updatedData: { reading: '1500' } // Try to set previous > last (1500 > 1000)
      })
    ).rejects.toThrow(WaterMeterReadingNotAllowedError)

    // Verify repository calls
    expect(mockWaterMeterReadingRepository.findById).toHaveBeenCalledWith(previousReadingId)
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(defaultWaterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReadingsForWaterMeter).toHaveBeenCalledWith(
      defaultWaterMeter.id,
      2
    )
  })

  it('should allow updating previous reading to equal last reading', async () => {
    // Arrange
    const previousReadingId = Id.generateUniqueId()
    const previousReading = WaterMeterReading.fromDto({
      id: previousReadingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '500',
      normalizedReading: 500,
      readingDate: new Date(Date.now() - 86400000), // 1 day ago
      notes: 'Previous reading'
    })
    const lastReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(), // Today
      notes: 'Last reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(previousReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([lastReading, previousReading])
      .mockResolvedValueOnce([lastReading, previousReading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    const result = await service.run({
      id: previousReadingId,
      updatedData: { reading: '1000' } // Set previous = last
    })

    // Assert
    expect(result.reading).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.reading.toString()).toBe('1000')
    expect(result.reading.normalizedReading).toBe(1000)
  })

  it('should recalculate excesses after updating previous reading', async () => {
    // Arrange
    const previousReadingId = Id.generateUniqueId()
    const previousReading = WaterMeterReading.fromDto({
      id: previousReadingId.toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '500',
      normalizedReading: 500,
      readingDate: new Date(Date.now() - 86400000), // 1 day ago
      notes: 'Previous reading'
    })
    const lastReading = WaterMeterReading.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterId: defaultWaterMeter.id.toString(),
      reading: '1000',
      normalizedReading: 1000,
      readingDate: new Date(), // Today
      notes: 'Last reading'
    })

    mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(previousReading)
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
    mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
      .mockResolvedValueOnce([lastReading, previousReading])
      .mockResolvedValueOnce([lastReading, previousReading])
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

    // Act
    await service.run({
      id: previousReadingId,
      updatedData: { reading: '700' }
    })

    // Assert - verify that lastReadingUpdater is called to recalculate excesses
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(
      defaultWaterMeter,
      expect.any(Array)
    )
  })

  describe('Image management integration', () => {
    const existingImage = WaterMeterReadingImage.fromDto({
      id: Id.generateUniqueId().toString(),
      waterMeterReadingId: defaultReading.id.toString(),
      url: 'https://r2.example.com/old-image.jpg',
      fileName: 'old-image.jpg',
      fileSize: 1024 * 100,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
      externalKey: 'water-meter-readings/123/old-image.jpg'
    })

    it('should update reading without affecting image when no image operations requested', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Original notes'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(undefined)

      // Act
      const result = await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Updated notes' }
      })

      // Assert
      expect(result.reading.notes).toBe('Updated notes')
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
    })

    it('should replace existing image when new image is provided', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading with image'
      })

      const newImageBuffer = Buffer.from('new-image-data')
      const newImageMetadata = FileMetadata.create({
        fileName: 'new-image.jpg',
        fileSize: 1024 * 150,
        mimeType: 'image/jpeg',
        originalName: 'updated-meter.jpg'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://r2.example.com/new-image.jpg')

      // Act
      await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Updated with new image' },
        image: {
          file: newImageBuffer,
          metadata: newImageMetadata
        }
      })

      // Assert - old image should be deleted, new image should be uploaded
      expect(mockFileDeleterService.run).toHaveBeenCalledWith({
        entityId: existingImage.id,
        entityType: expect.anything()
      })
      expect(mockFileUploaderService.run).toHaveBeenCalledWith({
        file: newImageBuffer,
        entityId: readingId,
        entityType: expect.anything(),
        metadata: newImageMetadata
      })
    })

    it('should delete image when deleteImage flag is true', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading with image'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)

      // Act
      await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Image removed' },
        deleteImage: true
      })

      // Assert
      expect(mockFileDeleterService.run).toHaveBeenCalledWith({
        entityId: existingImage.id,
        entityType: expect.anything()
      })
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
    })

    it('should add image to reading that did not have one', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading without image'
      })

      const imageBuffer = Buffer.from('new-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'first-image.jpg',
        fileSize: 1024 * 80,
        mimeType: 'image/jpeg',
        originalName: 'first-meter-photo.jpg'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue(
        'https://r2.example.com/first-image.jpg'
      )

      // Act
      await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Now with image' },
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
      expect(mockFileUploaderService.run).toHaveBeenCalledWith({
        file: imageBuffer,
        entityId: readingId,
        entityType: expect.anything(),
        metadata: imageMetadata
      })
    })

    it('should not call image services when image support is not configured', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Original notes'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)

      // Act
      await service.run({
        id: readingId,
        updatedData: { notes: 'Updated notes' }
      })

      // Assert - service without image support should not call image methods
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
    })

    it('should handle case where deleteImage is requested but no image exists', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading without image'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(undefined)

      // Act
      await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Try to delete non-existent image' },
        deleteImage: true
      })

      // Assert - should not call delete if no image exists
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
    })

    it('should update reading value and image in single operation', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Original'
      })

      const newImageBuffer = Buffer.from('updated-image')
      const newImageMetadata = FileMetadata.create({
        fileName: 'updated.jpg',
        fileSize: 1024 * 120,
        mimeType: 'image/jpeg',
        originalName: 'updated-photo.jpg'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://r2.example.com/updated.jpg')

      // Act
      const result = await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { reading: '2000', notes: 'Updated both' },
        image: {
          file: newImageBuffer,
          metadata: newImageMetadata
        }
      })

      // Assert - both reading and image should be updated
      expect(result.reading.reading.toString()).toBe('2000')
      expect(result.reading.notes).toBe('Updated both')
      expect(mockFileDeleterService.run).toHaveBeenCalled()
      expect(mockFileUploaderService.run).toHaveBeenCalled()
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
    })

    it('should update reading even if new image upload fails', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading without image'
      })

      const imageBuffer = Buffer.from('new-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'new-image.jpg',
        fileSize: 1024 * 120,
        mimeType: 'image/jpeg',
        originalName: 'new-photo.jpg'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockRejectedValue(
        new Error('Storage service unavailable')
      )

      // Act
      const result = await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Updated with failed image upload' },
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert - reading should be updated despite image failure
      expect(result.reading).toBeDefined()
      expect(result.imageUploadFailed).toBe(true)
      expect(result.imageError).toContain('Storage service unavailable')
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalled()
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
    })

    it('should keep old image if new upload fails', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading with image'
      })

      const newImageBuffer = Buffer.from('new-image-data')
      const newImageMetadata = FileMetadata.create({
        fileName: 'new-image.jpg',
        fileSize: 1024 * 150,
        mimeType: 'image/jpeg',
        originalName: 'updated-meter.jpg'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockRejectedValue(new Error('Upload failed'))

      // Act
      const result = await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Updated with failed image replacement' },
        image: {
          file: newImageBuffer,
          metadata: newImageMetadata
        }
      })

      // Assert - old image was deleted but new upload failed
      expect(result.reading).toBeDefined()
      expect(result.imageUploadFailed).toBe(true)
      expect(mockFileDeleterService.run).toHaveBeenCalledWith({
        entityId: existingImage.id,
        entityType: expect.anything()
      })
      expect(mockFileUploaderService.run).toHaveBeenCalled()
    })

    it('should return imageUploadFailed flag when upload fails', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Original'
      })

      const imageBuffer = Buffer.from('new-image')
      const imageMetadata = FileMetadata.create({
        fileName: 'new.jpg',
        fileSize: 1024 * 100,
        mimeType: 'image/jpeg',
        originalName: 'photo.jpg'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockRejectedValue(new Error('Invalid file'))

      // Act
      const result = await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { reading: '2000' },
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(result.imageUploadFailed).toBe(true)
      expect(result.imageError).toBe('Invalid file')
      expect(result.reading.reading.toString()).toBe('2000')
    })

    it('should update reading even if image delete fails', async () => {
      // Arrange
      const readingId = Id.generateUniqueId()
      const reading = WaterMeterReading.fromDto({
        id: readingId.toString(),
        waterMeterId: defaultWaterMeter.id.toString(),
        reading: '1000',
        normalizedReading: 1000,
        readingDate: new Date(),
        notes: 'Reading with image'
      })

      mockWaterMeterReadingRepository.findById = mock().mockResolvedValue(reading)
      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingRepository.findLastReadingsForWaterMeter = mock()
        .mockResolvedValueOnce([reading])
        .mockResolvedValueOnce([reading])
      mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
      mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterReadingImageRepository.findByWaterMeterReadingId =
        mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockRejectedValue(new Error('Storage delete failed'))

      // Act
      const result = await serviceWithImageSupport.run({
        id: readingId,
        updatedData: { notes: 'Updated with failed delete' },
        deleteImage: true
      })

      // Assert
      expect(result.reading).toBeDefined()
      expect(result.imageDeleteFailed).toBe(true)
      expect(result.imageError).toContain('Storage delete failed')
      expect(mockWaterMeterReadingRepository.save).toHaveBeenCalled()
      expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalled()
    })
  })
})
