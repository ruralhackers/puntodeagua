import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { FileMetadata } from '@pda/storage'
import { IncidentCreator } from '../../application/incident-creator.service'
import { Incident } from '../../domain/entities/incident'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'
import { createMockFileUploaderService, createMockIncidentRepository } from '../helpers/mocks'

describe('IncidentCreator Service with Images', () => {
  let mockRepository: IncidentRepository
  let mockFileUploaderService: any
  let incidentCreator: IncidentCreator

  beforeEach(() => {
    mockRepository = createMockIncidentRepository()
    mockFileUploaderService = createMockFileUploaderService()
    incidentCreator = new IncidentCreator(mockRepository, mockFileUploaderService)
  })

  describe('run - without images', () => {
    it('should create an incident without images', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.save = mock().mockResolvedValue(undefined)

      // Act
      const result = await incidentCreator.run({ incident })

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result.incident).toBe(incident)
      expect(result.imageUploadErrors).toBeUndefined()
      expect(mockFileUploaderService.run).not.toHaveBeenCalled()
    })
  })

  describe('run - with images', () => {
    it('should create an incident and upload multiple images successfully', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.save = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockResolvedValue('https://example.com/image.jpg')

      const images = [
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
      const result = await incidentCreator.run({ incident, images })

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result.incident).toBe(incident)
      expect(result.imageUploadErrors).toBeUndefined()
      expect(mockFileUploaderService.run).toHaveBeenCalledTimes(2)
    })

    it('should create incident even if image upload fails', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.save = mock().mockResolvedValue(undefined)
      mockFileUploaderService.run = mock().mockRejectedValue(new Error('Upload failed'))

      const images = [
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
      const result = await incidentCreator.run({ incident, images })

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result.incident).toBe(incident)
      expect(result.imageUploadErrors).toBeDefined()
      expect(result.imageUploadErrors).toHaveLength(1)
      expect(result.imageUploadErrors![0]).toContain('Image 1')
    })

    it('should create incident with partial success when some images fail', async () => {
      // Arrange
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.save = mock().mockResolvedValue(undefined)

      let callCount = 0
      mockFileUploaderService.run = mock().mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          return Promise.reject(new Error('Upload failed'))
        }
        return Promise.resolve('https://example.com/image.jpg')
      })

      const images = [
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
        },
        {
          file: Buffer.from('image3'),
          metadata: FileMetadata.create({
            fileName: 'image3.jpg',
            fileSize: 3072,
            mimeType: 'image/jpeg',
            originalName: 'image3.jpg'
          })
        }
      ]

      // Act
      const result = await incidentCreator.run({ incident, images })

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result.incident).toBe(incident)
      expect(result.imageUploadErrors).toBeDefined()
      expect(result.imageUploadErrors).toHaveLength(1)
      expect(result.imageUploadErrors![0]).toContain('Image 2')
      expect(mockFileUploaderService.run).toHaveBeenCalledTimes(3)
    })
  })

  describe('run - without FileUploaderService', () => {
    it('should create incident without attempting image upload when service not provided', async () => {
      // Arrange
      const incidentCreatorWithoutUploader = new IncidentCreator(mockRepository)
      const incident = Incident.create({
        title: 'Water leak',
        reporterName: 'John Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      mockRepository.save = mock().mockResolvedValue(undefined)

      const images = [
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
      const result = await incidentCreatorWithoutUploader.run({ incident, images })

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result.incident).toBe(incident)
      expect(result.imageUploadErrors).toBeUndefined()
    })
  })
})
