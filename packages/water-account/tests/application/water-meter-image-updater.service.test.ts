import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { FileDeleterService, FileUploaderService } from '@pda/storage'
import { FileMetadata, ImageEntityType } from '@pda/storage'
import { WaterMeterImageUpdaterService } from '../../application/water-meter-image-updater.service'
import { WaterMeter, WaterMeterImage } from '../../domain'
import { WaterMeterNotFoundError } from '../../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../../domain/repositories/water-meter.repository'
import type { WaterMeterImageRepository } from '../../domain/repositories/water-meter-image.repository'
import {
  createMockFileDeleterService,
  createMockFileUploaderService,
  createMockWaterMeterImageRepository,
  createMockWaterMeterRepository
} from '../helpers/mocks'

describe('WaterMeterImageUpdaterService', () => {
  let service: WaterMeterImageUpdaterService
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterMeterImageRepository: WaterMeterImageRepository
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
    lastReadingExcessConsumption: false,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  const existingImage = WaterMeterImage.fromDto({
    id: Id.generateUniqueId().toString(),
    waterMeterId: defaultWaterMeter.id.toString(),
    url: 'https://r2.example.com/old-image.jpg',
    fileName: 'old-image.jpg',
    fileSize: 1024 * 100,
    mimeType: 'image/jpeg',
    uploadedAt: new Date(),
    externalKey: 'water-meters/123/old-image.jpg'
  })

  beforeEach(() => {
    mockWaterMeterRepository = createMockWaterMeterRepository()
    mockWaterMeterImageRepository = createMockWaterMeterImageRepository()
    mockFileUploaderService = createMockFileUploaderService()
    mockFileDeleterService = createMockFileDeleterService()

    service = new WaterMeterImageUpdaterService(
      mockWaterMeterRepository,
      mockWaterMeterImageRepository,
      mockFileUploaderService,
      mockFileDeleterService
    )
  })

  describe('run - error handling', () => {
    it('should throw WaterMeterNotFoundError when water meter does not exist', async () => {
      // Arrange
      const waterMeterId = Id.generateUniqueId()
      mockWaterMeterRepository.findById = mock().mockResolvedValue(undefined)

      // Act & Assert
      await expect(
        service.run({
          waterMeterId
        })
      ).rejects.toThrow(WaterMeterNotFoundError)
    })
  })

  describe('run - upload new image', () => {
    it('should upload new image when none exists', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id
      const imageBuffer = Buffer.from('image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'meter.jpg',
        fileSize: 1024 * 100,
        mimeType: 'image/jpeg',
        originalName: 'meter-photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://r2.example.com/new-image.jpg')

      const newImage = WaterMeterImage.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeterId.toString(),
        url: 'https://r2.example.com/new-image.jpg',
        fileName: imageMetadata.fileName,
        fileSize: imageMetadata.fileSize,
        mimeType: imageMetadata.mimeType,
        uploadedAt: new Date(),
        externalKey: 'water-meters/new-image.jpg'
      })
      mockWaterMeterImageRepository.findByWaterMeterId = mock()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(newImage)

      // Act
      const result = await service.run({
        waterMeterId,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(waterMeterId)
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
      expect(mockFileUploaderService.run).toHaveBeenCalledWith({
        file: imageBuffer,
        entityId: waterMeterId,
        entityType: ImageEntityType.WATER_METER,
        metadata: imageMetadata,
        storageFolder: 'water-meters',
        createEntity: expect.any(Function)
      })
      expect(result.success).toBe(true)
      expect(result.image).toBeDefined()
      expect(result.image?.url).toBe('https://r2.example.com/new-image.jpg')
    })

    it('should verify correct entity type is passed to FileUploaderService', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id
      const imageBuffer = Buffer.from('image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'meter.jpg',
        fileSize: 1024 * 100,
        mimeType: 'image/jpeg',
        originalName: 'meter-photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://r2.example.com/new-image.jpg')

      // Act
      await service.run({
        waterMeterId,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(mockFileUploaderService.run).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: ImageEntityType.WATER_METER
        })
      )
    })
  })

  describe('run - replace existing image', () => {
    it('should delete old image and upload new one when replacing', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id
      const imageBuffer = Buffer.from('new-image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'new-meter.jpg',
        fileSize: 1024 * 150,
        mimeType: 'image/jpeg',
        originalName: 'new-meter-photo.jpg'
      })

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock()
        .mockResolvedValueOnce(existingImage)
        .mockResolvedValueOnce(existingImage) // Still old before upload completes
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://r2.example.com/new-image.jpg')

      const newImage = WaterMeterImage.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeterId.toString(),
        url: 'https://r2.example.com/new-image.jpg',
        fileName: imageMetadata.fileName,
        fileSize: imageMetadata.fileSize,
        mimeType: imageMetadata.mimeType,
        uploadedAt: new Date(),
        externalKey: 'water-meters/new-image.jpg'
      })
      mockWaterMeterImageRepository.findByWaterMeterId = mock()
        .mockResolvedValueOnce(existingImage)
        .mockResolvedValueOnce(newImage)

      // Act
      const result = await service.run({
        waterMeterId,
        image: {
          file: imageBuffer,
          metadata: imageMetadata
        }
      })

      // Assert
      expect(mockFileDeleterService.run).toHaveBeenCalledWith({
        fileId: existingImage.id,
        entityType: ImageEntityType.WATER_METER
      })
      expect(mockFileUploaderService.run).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.image?.url).toBe('https://r2.example.com/new-image.jpg')
    })
  })

  describe('run - delete image', () => {
    it('should delete existing image when deleteImage flag is true', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)

      // Act
      const result = await service.run({
        waterMeterId,
        deleteImage: true
      })

      // Assert
      expect(mockFileDeleterService.run).toHaveBeenCalledWith({
        fileId: existingImage.id,
        entityType: ImageEntityType.WATER_METER
      })
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.deleted).toBe(true)
    })

    it('should not fail when deleteImage is true but no image exists', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(undefined)

      // Act
      const result = await service.run({
        waterMeterId,
        deleteImage: true
      })

      // Assert
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('run - no operation', () => {
    it('should return success when no image operations requested', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(existingImage)

      // Act
      const result = await service.run({
        waterMeterId
      })

      // Assert
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('run - error propagation', () => {
    it('should propagate errors from FileUploaderService', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id
      const imageBuffer = Buffer.from('image-data')
      const imageMetadata = FileMetadata.create({
        fileName: 'meter.jpg',
        fileSize: 1024 * 100,
        mimeType: 'image/jpeg',
        originalName: 'meter-photo.jpg'
      })

      const uploadError = new Error('Upload failed')

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockRejectedValue(uploadError)

      // Act & Assert
      await expect(
        service.run({
          waterMeterId,
          image: {
            file: imageBuffer,
            metadata: imageMetadata
          }
        })
      ).rejects.toThrow('Upload failed')
    })

    it('should propagate errors from FileDeleterService', async () => {
      // Arrange
      const waterMeterId = defaultWaterMeter.id
      const deleteError = new Error('Delete failed')

      mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeter)
      mockWaterMeterImageRepository.findByWaterMeterId = mock().mockResolvedValue(existingImage)
      mockFileDeleterService.run = mock().mockRejectedValue(deleteError)

      // Act & Assert
      await expect(
        service.run({
          waterMeterId,
          deleteImage: true
        })
      ).rejects.toThrow('Delete failed')
    })
  })
})
