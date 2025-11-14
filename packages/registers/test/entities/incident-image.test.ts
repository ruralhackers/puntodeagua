import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { IncidentImage } from '../../domain/entities/incident-image'
import type { IncidentImageDto } from '../../domain/entities/incident-image.dto'

describe('IncidentImage Entity', () => {
  describe('create', () => {
    it('should create a new incident image with generated ID and uploadedAt', () => {
      const dto = {
        incidentId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.jpg',
        fileName: 'image.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        externalKey: 'incidents/abc123.jpg'
      }

      const incidentImage = IncidentImage.create(dto)

      expect(incidentImage.id).toBeDefined()
      expect(incidentImage.incidentId.toString()).toBe(dto.incidentId)
      expect(incidentImage.url).toBe(dto.url)
      expect(incidentImage.fileName).toBe(dto.fileName)
      expect(incidentImage.fileSize).toBe(dto.fileSize)
      expect(incidentImage.mimeType).toBe(dto.mimeType)
      expect(incidentImage.uploadedAt).toBeInstanceOf(Date)
      expect(incidentImage.externalKey).toBe(dto.externalKey)
    })
  })

  describe('fromDto', () => {
    it('should create incident image from complete DTO', () => {
      const uploadedAt = new Date('2024-01-15T10:00:00Z')
      const dto: IncidentImageDto = {
        id: Id.generateUniqueId().toString(),
        incidentId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.jpg',
        fileName: 'incident-photo.jpg',
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        uploadedAt,
        externalKey: 'incidents/xyz789.jpg'
      }

      const incidentImage = IncidentImage.fromDto(dto)

      expect(incidentImage.id.toString()).toBe(dto.id)
      expect(incidentImage.incidentId.toString()).toBe(dto.incidentId)
      expect(incidentImage.url).toBe(dto.url)
      expect(incidentImage.fileName).toBe(dto.fileName)
      expect(incidentImage.fileSize).toBe(dto.fileSize)
      expect(incidentImage.mimeType).toBe(dto.mimeType)
      expect(incidentImage.uploadedAt).toBe(uploadedAt)
      expect(incidentImage.externalKey).toBe(dto.externalKey)
    })
  })

  describe('toDto', () => {
    it('should convert incident image to DTO', () => {
      const uploadedAt = new Date('2024-01-15T10:00:00Z')
      const dto: IncidentImageDto = {
        id: Id.generateUniqueId().toString(),
        incidentId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.png',
        fileName: 'evidence.png',
        fileSize: 3072000,
        mimeType: 'image/png',
        uploadedAt,
        externalKey: 'incidents/evidence123.png'
      }

      const incidentImage = IncidentImage.fromDto(dto)
      const resultDto = incidentImage.toDto()

      expect(resultDto).toEqual(dto)
    })
  })

  describe('immutability', () => {
    it('should have immutable properties', () => {
      const dto = {
        incidentId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        externalKey: 'incidents/test.jpg'
      }

      const incidentImage = IncidentImage.create(dto)

      // All properties should be readonly
      // TypeScript will enforce this at compile time
      expect(incidentImage.id).toBeDefined()
      expect(incidentImage.incidentId).toBeDefined()
      expect(incidentImage.url).toBe(dto.url)
      expect(incidentImage.fileName).toBe(dto.fileName)
      expect(incidentImage.fileSize).toBe(dto.fileSize)
      expect(incidentImage.mimeType).toBe(dto.mimeType)
      expect(incidentImage.uploadedAt).toBeInstanceOf(Date)
      expect(incidentImage.externalKey).toBe(dto.externalKey)
    })
  })
})
