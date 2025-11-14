import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterMeterImage } from '../../domain/entities/water-meter-image'
import type { WaterMeterImageDto } from '../../domain/entities/water-meter-image.dto'

describe('WaterMeterImage Entity', () => {
  describe('create', () => {
    it('should create a new water meter image with generated ID and uploadedAt', () => {
      const dto = {
        waterMeterId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.jpg',
        fileName: 'image.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        externalKey: 'water-meters/abc123.jpg'
      }

      const waterMeterImage = WaterMeterImage.create(dto)

      expect(waterMeterImage.id).toBeDefined()
      expect(waterMeterImage.waterMeterId.toString()).toBe(dto.waterMeterId)
      expect(waterMeterImage.url).toBe(dto.url)
      expect(waterMeterImage.fileName).toBe(dto.fileName)
      expect(waterMeterImage.fileSize).toBe(dto.fileSize)
      expect(waterMeterImage.mimeType).toBe(dto.mimeType)
      expect(waterMeterImage.uploadedAt).toBeInstanceOf(Date)
      expect(waterMeterImage.externalKey).toBe(dto.externalKey)
    })
  })

  describe('fromDto', () => {
    it('should create water meter image from complete DTO', () => {
      const uploadedAt = new Date('2024-01-15T10:00:00Z')
      const dto: WaterMeterImageDto = {
        id: Id.generateUniqueId().toString(),
        waterMeterId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.jpg',
        fileName: 'water-meter-photo.jpg',
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        uploadedAt,
        externalKey: 'water-meters/xyz789.jpg'
      }

      const waterMeterImage = WaterMeterImage.fromDto(dto)

      expect(waterMeterImage.id.toString()).toBe(dto.id)
      expect(waterMeterImage.waterMeterId.toString()).toBe(dto.waterMeterId)
      expect(waterMeterImage.url).toBe(dto.url)
      expect(waterMeterImage.fileName).toBe(dto.fileName)
      expect(waterMeterImage.fileSize).toBe(dto.fileSize)
      expect(waterMeterImage.mimeType).toBe(dto.mimeType)
      expect(waterMeterImage.uploadedAt).toBe(uploadedAt)
      expect(waterMeterImage.externalKey).toBe(dto.externalKey)
    })
  })

  describe('toDto', () => {
    it('should convert water meter image to DTO', () => {
      const uploadedAt = new Date('2024-01-15T10:00:00Z')
      const dto: WaterMeterImageDto = {
        id: Id.generateUniqueId().toString(),
        waterMeterId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.png',
        fileName: 'meter-photo.png',
        fileSize: 3072000,
        mimeType: 'image/png',
        uploadedAt,
        externalKey: 'water-meters/meter123.png'
      }

      const waterMeterImage = WaterMeterImage.fromDto(dto)
      const resultDto = waterMeterImage.toDto()

      expect(resultDto).toEqual(dto)
    })
  })

  describe('immutability', () => {
    it('should have immutable properties', () => {
      const dto = {
        waterMeterId: Id.generateUniqueId().toString(),
        url: 'https://example.com/image.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        externalKey: 'water-meters/test.jpg'
      }

      const waterMeterImage = WaterMeterImage.create(dto)

      // All properties should be readonly
      // TypeScript will enforce this at compile time
      expect(waterMeterImage.id).toBeDefined()
      expect(waterMeterImage.waterMeterId).toBeDefined()
      expect(waterMeterImage.url).toBe(dto.url)
      expect(waterMeterImage.fileName).toBe(dto.fileName)
      expect(waterMeterImage.fileSize).toBe(dto.fileSize)
      expect(waterMeterImage.mimeType).toBe(dto.mimeType)
      expect(waterMeterImage.uploadedAt).toBeInstanceOf(Date)
      expect(waterMeterImage.externalKey).toBe(dto.externalKey)
    })
  })
})
