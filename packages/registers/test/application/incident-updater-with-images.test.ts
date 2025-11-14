import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { FileMetadata } from '@pda/storage'
import { IncidentUpdater } from '../../application/incident-updater.service'
import { Incident } from '../../domain/entities/incident'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'
import {
  createMockFileDeleterService,
  createMockFileUploaderService,
  createMockIncidentRepository
} from '../helpers/mocks'

describe('IncidentUpdater Service with Images', () => {
  let mockRepository: IncidentRepository
  let mockFileUploaderService: any
  let mockFileDeleterService: any
  let incidentUpdater: IncidentUpdater

  beforeEach(() => {
    mockRepository = createMockIncidentRepository()
    mockFileUploaderService = createMockFileUploaderService()
    mockFileDeleterService = createMockFileDeleterService()
    incidentUpdater = new IncidentUpdater(
      mockRepository,
      mockFileUploaderService,
      mockFileDeleterService
    )
  })

  describe('run - without image changes', () => {
    it('should update incident without modifying images', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      // Act
      const result = await incidentUpdater.run({
        id: incident.id,
        updatedIncidentData: {
          status: 'closed',
          endAt: new Date(),
          closingDescription: 'Fixed the leak'
        }
      })

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(incident.id)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.incident.status.toString()).toBe('closed')
      expect(result.imageUploadErrors).toBeUndefined()
      expect(result.imageDeleteErrors).toBeUndefined()
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
      expect(mockFileDeleterService.run).not.toHaveBeenCalled()
    })
  })

  describe('run - adding new images', () => {
    it('should update incident and add new images', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://example.com/image.jpg')

      const newImages = [
        {
          file: Buffer.from('image1'),
          metadata: FileMetadata.create({
            fileName: 'image1.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            originalName: 'image1.jpg'
          })
        },
        {
          file: Buffer.from('image2'),
          metadata: FileMetadata.create({
            fileName: 'image2.jpg',
            fileSize: 2048,
            mimeType: 'image/jpeg',
            originalName: 'image2.jpg'
          })
        }
      ]

      // Act
      const result = await incidentUpdater.run({
        id: incident.id,
        updatedIncidentData: {
          status: 'open',
          description: 'Updated description'
        },
        newImages
      })

      // Assert
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.imageUploadErrors).toBeUndefined()
      expect(mockFileUploaderService.run).toHaveBeenCalledTimes(2)
    })

    it('should update incident with partial success when some image uploads fail', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      let callCount = 0
      mockFileUploaderService.run = mock().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('Upload failed'))
        }
        return Promise.resolve('https://example.com/image.jpg')
      })

      const newImages = [
        {
          file: Buffer.from('image1'),
          metadata: FileMetadata.create({
            fileName: 'image1.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            originalName: 'image1.jpg'
          })
        },
        {
          file: Buffer.from('image2'),
          metadata: FileMetadata.create({
            fileName: 'image2.jpg',
            fileSize: 2048,
            mimeType: 'image/jpeg',
            originalName: 'image2.jpg'
          })
        }
      ]

      // Act
      const result = await incidentUpdater.run({
        id: incident.id,
        updatedIncidentData: { status: 'open' },
        newImages
      })

      // Assert
      expect(result.imageUploadErrors).toBeDefined()
      expect(result.imageUploadErrors).toHaveLength(1)
      expect(result.imageUploadErrors![0]).toContain('Image 1')
      expect(mockFileUploaderService.run).toHaveBeenCalledTimes(2)
    })
  })

  describe('run - deleting images', () => {
    it('should update incident and delete specified images', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)

      const deleteImageIds = [Id.generateUniqueId(), Id.generateUniqueId()]

      // Act
      const result = await incidentUpdater.run({
        id: incident.id,
        updatedIncidentData: { status: 'open' },
        deleteImageIds
      })

      // Assert
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.imageDeleteErrors).toBeUndefined()
      expect(mockFileDeleterService.run).toHaveBeenCalledTimes(2)
    })

    it('should continue deleting images even if some deletions fail', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      let callCount = 0
      mockFileDeleterService.run = mock().mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          return Promise.reject(new Error('Delete failed'))
        }
        return Promise.resolve(undefined)
      })

      const deleteImageIds = [Id.generateUniqueId(), Id.generateUniqueId(), Id.generateUniqueId()]

      // Act
      const result = await incidentUpdater.run({
        id: incident.id,
        updatedIncidentData: { status: 'open' },
        deleteImageIds
      })

      // Assert
      expect(result.imageDeleteErrors).toBeDefined()
      expect(result.imageDeleteErrors).toHaveLength(1)
      expect(mockFileDeleterService.run).toHaveBeenCalledTimes(3)
    })
  })

  describe('run - adding and deleting images simultaneously', () => {
    it('should delete images first, then add new ones', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)
      mockFileDeleterService.run = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://example.com/image.jpg')

      const deleteImageIds = [Id.generateUniqueId()]
      const newImages = [
        {
          file: Buffer.from('image1'),
          metadata: FileMetadata.create({
            fileName: 'image1.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            originalName: 'image1.jpg'
          })
        }
      ]

      // Act
      const result = await incidentUpdater.run({
        id: incident.id,
        updatedIncidentData: { status: 'open' },
        deleteImageIds,
        newImages
      })

      // Assert
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.imageDeleteErrors).toBeUndefined()
      expect(result.imageUploadErrors).toBeUndefined()
      expect(mockFileDeleterService.run).toHaveBeenCalledTimes(1)
      expect(mockFileUploaderService.run).toHaveBeenCalledTimes(1)
    })
  })

  describe('run - without file services', () => {
    it('should update incident without attempting image operations when services not provided', async () => {
      // Arrange
      const incidentUpdaterWithoutServices = new IncidentUpdater(mockRepository)
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.findById = mock().mockResolvedValue(incident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      const deleteImageIds = [Id.generateUniqueId()]
      const newImages = [
        {
          file: Buffer.from('image1'),
          metadata: FileMetadata.create({
            fileName: 'image1.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            originalName: 'image1.jpg'
          })
        }
      ]

      // Act
      const result = await incidentUpdaterWithoutServices.run({
        id: incident.id,
        updatedIncidentData: { status: 'closed', endAt: new Date() },
        deleteImageIds,
        newImages
      })

      // Assert
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.incident.status.toString()).toBe('closed')
      expect(result.imageDeleteErrors).toBeUndefined()
      expect(result.imageUploadErrors).toBeUndefined()
    })
  })
})
