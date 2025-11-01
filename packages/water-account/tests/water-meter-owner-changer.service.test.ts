import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterMeterOwnerChanger } from '../application/water-meter-owner-changer.service'
import { WaterAccount, WaterMeter } from '../domain'
import type { WaterAccountRepository } from '../domain/repositories/water-account.repository'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import { createMockWaterAccountRepository, createMockWaterMeterRepository } from './helpers/mocks'

describe('WaterMeterOwnerChanger', () => {
  let service: WaterMeterOwnerChanger
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterAccountRepository: WaterAccountRepository

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

  const oldOwnerId = Id.generateUniqueId()
  const existingOwnerId = Id.generateUniqueId()

  const defaultWaterMeter = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter',
    waterAccountId: oldOwnerId.toString(),
    measurementUnit: 'L',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date('2024-01-01'),
    lastReadingExcessConsumption: false,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  const existingWaterAccount = WaterAccount.fromDto({
    id: existingOwnerId.toString(),
    name: 'Existing Owner',
    nationalId: '12345678A',
    notes: 'Existing account'
  })

  beforeEach(() => {
    mockWaterMeterRepository = createMockWaterMeterRepository()
    mockWaterAccountRepository = createMockWaterAccountRepository()

    service = new WaterMeterOwnerChanger(mockWaterMeterRepository, mockWaterAccountRepository)
  })

  describe('Successful owner change', () => {
    it('should successfully change owner to an existing water account', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.findById = mock(() => Promise.resolve(existingWaterAccount))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterMeterId: defaultWaterMeter.id,
        newWaterAccountId: existingOwnerId
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.waterMeterId).toBe(defaultWaterMeter.id.toString())
      expect(result.newWaterAccountId).toBe(existingOwnerId.toString())

      // Verify the water meter was saved with new owner
      expect(mockWaterMeterRepository.save).toHaveBeenCalledTimes(1)
      const savedMeter = (mockWaterMeterRepository.save as any).mock.calls[0][0] as WaterMeter
      expect(savedMeter.waterAccountId.toString()).toBe(existingOwnerId.toString())
    })

    it('should successfully change owner by creating a new water account', async () => {
      // Arrange
      const newAccountData = {
        name: 'New Owner',
        nationalId: '87654321B',
        notes: 'New account'
      }

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.save = mock(() => Promise.resolve())
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterMeterId: defaultWaterMeter.id,
        newWaterAccountData: newAccountData
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.waterMeterId).toBe(defaultWaterMeter.id.toString())
      expect(result.newWaterAccountId).toBeDefined()

      // Verify new water account was created
      expect(mockWaterAccountRepository.save).toHaveBeenCalledTimes(1)
      const savedAccount = (mockWaterAccountRepository.save as any).mock.calls[0][0] as WaterAccount
      expect(savedAccount.name).toBe(newAccountData.name)
      expect(savedAccount.nationalId).toBe(newAccountData.nationalId)
      expect(savedAccount.notes).toBe(newAccountData.notes)

      // Verify the water meter was saved with new owner
      expect(mockWaterMeterRepository.save).toHaveBeenCalledTimes(1)
      const savedMeter = (mockWaterMeterRepository.save as any).mock.calls[0][0] as WaterMeter
      expect(savedMeter.waterAccountId.toString()).toBe(result.newWaterAccountId)
    })

    it('should create new water account without notes', async () => {
      // Arrange
      const newAccountData = {
        name: 'New Owner',
        nationalId: '87654321B'
      }

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.save = mock(() => Promise.resolve())
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterMeterId: defaultWaterMeter.id,
        newWaterAccountData: newAccountData
      })

      // Assert
      expect(result).toBeDefined()

      // Verify new water account was created without notes
      const savedAccount = (mockWaterAccountRepository.save as any).mock.calls[0][0] as WaterAccount
      expect(savedAccount.name).toBe(newAccountData.name)
      expect(savedAccount.nationalId).toBe(newAccountData.nationalId)
      expect(savedAccount.notes).toBeUndefined()
    })
  })

  describe('Error handling', () => {
    it('should throw error when water meter does not exist', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(undefined))

      // Act & Assert
      await expect(
        service.run({
          waterMeterId: Id.generateUniqueId(),
          newWaterAccountId: existingOwnerId
        })
      ).rejects.toThrow('Water meter not found')
    })

    it('should throw error when existing water account does not exist', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.findById = mock(() => Promise.resolve(undefined))

      // Act & Assert
      await expect(
        service.run({
          waterMeterId: defaultWaterMeter.id,
          newWaterAccountId: Id.generateUniqueId()
        })
      ).rejects.toThrow('Water account not found')
    })

    it('should throw error when neither newWaterAccountId nor newWaterAccountData is provided', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))

      // Act & Assert
      await expect(
        service.run({
          waterMeterId: defaultWaterMeter.id
        })
      ).rejects.toThrow('Must provide either newWaterAccountId or newWaterAccountData')
    })
  })

  describe('Verification of side effects', () => {
    it('should not modify old water account when changing to existing account', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.findById = mock(() => Promise.resolve(existingWaterAccount))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      await service.run({
        waterMeterId: defaultWaterMeter.id,
        newWaterAccountId: existingOwnerId
      })

      // Assert - water account repository save should not be called
      expect(mockWaterAccountRepository.save).not.toHaveBeenCalled()
    })

    it('should update only the waterAccountId of the water meter', async () => {
      // Arrange
      const originalName = defaultWaterMeter.name
      const originalMeasurementUnit = defaultWaterMeter.measurementUnit.toString()

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.findById = mock(() => Promise.resolve(existingWaterAccount))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      await service.run({
        waterMeterId: defaultWaterMeter.id,
        newWaterAccountId: existingOwnerId
      })

      // Assert - only waterAccountId should change, everything else should remain the same
      const savedMeter = (mockWaterMeterRepository.save as any).mock.calls[0][0] as WaterMeter
      expect(savedMeter.name).toBe(originalName)
      expect(savedMeter.measurementUnit.toString()).toBe(originalMeasurementUnit)
      expect(savedMeter.isActive).toBe(true)
      expect(savedMeter.waterAccountId.toString()).toBe(existingOwnerId.toString())
    })

    it('should preserve water meter readings when changing owner', async () => {
      // Arrange
      const waterMeterWithReadings = WaterMeter.fromDto({
        ...defaultWaterMeter.toDto(),
        lastReadingNormalizedValue: 5000,
        lastReadingDate: new Date('2024-06-01'),
        lastReadingExcessConsumption: true
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(waterMeterWithReadings))
      mockWaterAccountRepository.findById = mock(() => Promise.resolve(existingWaterAccount))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      await service.run({
        waterMeterId: waterMeterWithReadings.id,
        newWaterAccountId: existingOwnerId
      })

      // Assert - readings should be preserved
      const savedMeter = (mockWaterMeterRepository.save as any).mock.calls[0][0] as WaterMeter
      expect(savedMeter.lastReadingNormalizedValue).toBe(5000)
      expect(savedMeter.lastReadingDate?.toISOString()).toBe(new Date('2024-06-01').toISOString())
      expect(savedMeter.lastReadingExcessConsumption).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle changing owner of multiple water meters in sequence', async () => {
      // Arrange
      const waterMeter1 = WaterMeter.fromDto({
        ...defaultWaterMeter.toDto(),
        id: Id.generateUniqueId().toString(),
        name: 'Meter 1'
      })
      const waterMeter2 = WaterMeter.fromDto({
        ...defaultWaterMeter.toDto(),
        id: Id.generateUniqueId().toString(),
        name: 'Meter 2'
      })

      mockWaterAccountRepository.findById = mock(() => Promise.resolve(existingWaterAccount))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act - change owner of first meter
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(waterMeter1))
      const result1 = await service.run({
        waterMeterId: waterMeter1.id,
        newWaterAccountId: existingOwnerId
      })

      // Act - change owner of second meter
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(waterMeter2))
      const result2 = await service.run({
        waterMeterId: waterMeter2.id,
        newWaterAccountId: existingOwnerId
      })

      // Assert
      expect(result1.waterMeterId).toBe(waterMeter1.id.toString())
      expect(result2.waterMeterId).toBe(waterMeter2.id.toString())
      expect(mockWaterMeterRepository.save).toHaveBeenCalledTimes(2)
    })

    it('should allow changing owner from an existing account to a new account', async () => {
      // Arrange
      const newAccountData = {
        name: 'Brand New Owner',
        nationalId: '11111111A',
        notes: 'Transferred from existing owner'
      }

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultWaterMeter))
      mockWaterAccountRepository.save = mock(() => Promise.resolve())
      mockWaterMeterRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterMeterId: defaultWaterMeter.id,
        newWaterAccountData: newAccountData
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.newWaterAccountId).not.toBe(oldOwnerId.toString())
      
      const savedAccount = (mockWaterAccountRepository.save as any).mock.calls[0][0] as WaterAccount
      expect(savedAccount.name).toBe(newAccountData.name)
      expect(savedAccount.notes).toBe(newAccountData.notes)
    })
  })
})

