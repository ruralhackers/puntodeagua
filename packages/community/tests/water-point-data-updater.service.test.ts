import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterPointDataUpdater } from '../application/water-point-data-updater.service'
import { WaterPoint } from '../domain'
import type { WaterPointRepository } from '../domain/repositories/water-point.repository'
import { createMockWaterPointRepository } from './helpers/mocks'

describe('WaterPointDataUpdater', () => {
  let service: WaterPointDataUpdater
  let mockWaterPointRepository: WaterPointRepository

  // Default test entities
  const defaultCommunityZoneId = Id.generateUniqueId()
  const defaultWaterDepositId1 = Id.generateUniqueId()
  const defaultWaterDepositId2 = Id.generateUniqueId()

  const defaultWaterPoint = WaterPoint.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test House',
    location: '40.4168,-3.7038',
    fixedPopulation: 4,
    floatingPopulation: 2,
    cadastralReference: 'TEST-001',
    communityZoneId: defaultCommunityZoneId.toString(),
    waterDepositIds: [defaultWaterDepositId1.toString()],
    notes: 'Original notes'
  })

  beforeEach(() => {
    mockWaterPointRepository = createMockWaterPointRepository()
    service = new WaterPointDataUpdater(mockWaterPointRepository)
  })

  describe('Successful updates', () => {
    it('should successfully update fixed population', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          fixedPopulation: 6
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.waterPointId).toBe(defaultWaterPoint.id.toString())
      expect(result.updatedFields).toContain('fixedPopulation')

      // Verify the water point was saved with new value
      expect(mockWaterPointRepository.save).toHaveBeenCalledTimes(1)
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.fixedPopulation).toBe(6)
    })

    it('should successfully update floating population', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          floatingPopulation: 5
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toContain('floatingPopulation')

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.floatingPopulation).toBe(5)
    })

    it('should successfully update cadastral reference', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          cadastralReference: 'NEW-REF-123'
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toContain('cadastralReference')

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.cadastralReference).toBe('NEW-REF-123')
    })

    it('should successfully update notes', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          notes: 'Updated notes'
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toContain('notes')

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.notes).toBe('Updated notes')
    })

    it('should successfully update community zone', async () => {
      // Arrange
      const newZoneId = Id.generateUniqueId()
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          communityZoneId: newZoneId
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toContain('communityZoneId')

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.communityZoneId.toString()).toBe(newZoneId.toString())
    })

    it('should successfully update water deposit IDs', async () => {
      // Arrange
      const newDepositId = Id.generateUniqueId()
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          waterDepositIds: [newDepositId, defaultWaterDepositId2]
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toContain('waterDepositIds')

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.waterDepositIds).toHaveLength(2)
      expect(savedWaterPoint.waterDepositIds[0].toString()).toBe(newDepositId.toString())
    })

    it('should successfully update name', async () => {
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          name: '  Casa Nueva  '
        }
      })

      expect(result.updatedFields).toContain('name')
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.name).toBe('Casa Nueva')
    })

    it('should successfully update location', async () => {
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          location: 'Calle Nova 12'
        }
      })

      expect(result.updatedFields).toContain('location')
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.location).toBe('Calle Nova 12')
    })

    it('should successfully update connection number', async () => {
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          connectionNumber: 'B62'
        }
      })

      expect(result.updatedFields).toContain('connectionNumber')
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.connectionNumber).toBe('B62')
    })

    it('should clear connection number when empty string is provided', async () => {
      const waterPointWithConnection = WaterPoint.fromDto({
        ...defaultWaterPoint.toDto(),
        connectionNumber: 'obra'
      })
      mockWaterPointRepository.findById = mock(() => Promise.resolve(waterPointWithConnection))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      await service.run({
        waterPointId: waterPointWithConnection.id,
        updatedData: {
          connectionNumber: '   '
        }
      })

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.connectionNumber).toBeNull()
    })

    it('should successfully update multiple fields at once', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          fixedPopulation: 8,
          floatingPopulation: 3,
          cadastralReference: 'MULTI-UPDATE-001',
          notes: 'Multiple fields updated'
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toHaveLength(4)
      expect(result.updatedFields).toContain('fixedPopulation')
      expect(result.updatedFields).toContain('floatingPopulation')
      expect(result.updatedFields).toContain('cadastralReference')
      expect(result.updatedFields).toContain('notes')

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.fixedPopulation).toBe(8)
      expect(savedWaterPoint.floatingPopulation).toBe(3)
      expect(savedWaterPoint.cadastralReference).toBe('MULTI-UPDATE-001')
      expect(savedWaterPoint.notes).toBe('Multiple fields updated')
    })

    it('should handle zero values for population fields', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          fixedPopulation: 0,
          floatingPopulation: 0
        }
      })

      // Assert
      expect(result).toBeDefined()
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.fixedPopulation).toBe(0)
      expect(savedWaterPoint.floatingPopulation).toBe(0)
    })

    it('should handle empty water deposit IDs array', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          waterDepositIds: []
        }
      })

      // Assert
      expect(result).toBeDefined()
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.waterDepositIds).toHaveLength(0)
    })

    it('should handle empty string for notes', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          notes: ''
        }
      })

      // Assert
      expect(result).toBeDefined()
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.notes).toBe('')
    })
  })

  describe('Error handling', () => {
    it('should throw error when water point does not exist', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(undefined))

      // Act & Assert
      await expect(
        service.run({
          waterPointId: Id.generateUniqueId(),
          updatedData: {
            fixedPopulation: 5
          }
        })
      ).rejects.toThrow('Water point not found')
    })

    it('should throw error when fixed population is negative', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))

      // Act & Assert
      await expect(
        service.run({
          waterPointId: defaultWaterPoint.id,
          updatedData: {
            fixedPopulation: -1
          }
        })
      ).rejects.toThrow('Fixed population cannot be negative')
    })

    it('should throw error when floating population is negative', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))

      // Act & Assert
      await expect(
        service.run({
          waterPointId: defaultWaterPoint.id,
          updatedData: {
            floatingPopulation: -5
          }
        })
      ).rejects.toThrow('Floating population cannot be negative')
    })

    it('should throw error when name is empty', async () => {
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))

      await expect(
        service.run({
          waterPointId: defaultWaterPoint.id,
          updatedData: {
            name: '   '
          }
        })
      ).rejects.toThrow('Name cannot be empty')
    })
  })

  describe('Preserving unchanged fields', () => {
    it('should preserve unchanged fields when updating only one field', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          fixedPopulation: 10
        }
      })

      // Assert - other fields should remain unchanged
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.floatingPopulation).toBe(defaultWaterPoint.floatingPopulation)
      expect(savedWaterPoint.cadastralReference).toBe(defaultWaterPoint.cadastralReference)
      expect(savedWaterPoint.notes).toBe(defaultWaterPoint.notes)
      expect(savedWaterPoint.name).toBe(defaultWaterPoint.name)
      expect(savedWaterPoint.location).toBe(defaultWaterPoint.location)
    })

    it('should preserve connectionNumber when updating other fields', async () => {
      const waterPointWithConnection = WaterPoint.fromDto({
        ...defaultWaterPoint.toDto(),
        connectionNumber: 'C35'
      })
      mockWaterPointRepository.findById = mock(() => Promise.resolve(waterPointWithConnection))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      await service.run({
        waterPointId: waterPointWithConnection.id,
        updatedData: {
          fixedPopulation: 7
        }
      })

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.connectionNumber).toBe('C35')
      expect(savedWaterPoint.fixedPopulation).toBe(7)
    })

    it('should preserve name and location when omitted', async () => {
      const originalName = defaultWaterPoint.name
      const originalLocation = defaultWaterPoint.location
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          fixedPopulation: 10,
          notes: 'Changed notes'
        }
      })

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.name).toBe(originalName)
      expect(savedWaterPoint.location).toBe(originalLocation)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle updating the same water point multiple times', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act - first update
      await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          fixedPopulation: 5
        }
      })

      // Act - second update
      await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          floatingPopulation: 3
        }
      })

      // Assert
      expect(mockWaterPointRepository.save).toHaveBeenCalledTimes(2)
    })

    it('should update all editable fields in one operation', async () => {
      // Arrange
      const newZoneId = Id.generateUniqueId()
      const newDepositIds = [Id.generateUniqueId(), Id.generateUniqueId()]
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: {
          name: 'Casa Actualizada',
          location: 'Nova ubicación',
          connectionNumber: 'B99',
          fixedPopulation: 12,
          floatingPopulation: 8,
          cadastralReference: 'ALL-FIELDS-001',
          notes: 'All fields updated',
          communityZoneId: newZoneId,
          waterDepositIds: newDepositIds
        }
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.updatedFields).toHaveLength(9)

      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.name).toBe('Casa Actualizada')
      expect(savedWaterPoint.location).toBe('Nova ubicación')
      expect(savedWaterPoint.connectionNumber).toBe('B99')
      expect(savedWaterPoint.fixedPopulation).toBe(12)
      expect(savedWaterPoint.floatingPopulation).toBe(8)
      expect(savedWaterPoint.cadastralReference).toBe('ALL-FIELDS-001')
      expect(savedWaterPoint.notes).toBe('All fields updated')
      expect(savedWaterPoint.communityZoneId.toString()).toBe(newZoneId.toString())
      expect(savedWaterPoint.waterDepositIds).toHaveLength(2)
    })
  })
})
