import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterDepositUpdater } from '../application/water-deposit-updater.service'
import { WaterDeposit } from '../domain/entities/water-deposit'
import type { WaterDepositRepository } from '../domain/repositories/water-deposit.repository'
import { createMockWaterDepositRepository } from './helpers/mocks'

describe('WaterDepositUpdater', () => {
  let service: WaterDepositUpdater
  let mockWaterDepositRepository: WaterDepositRepository

  const defaultCommunityId = Id.generateUniqueId()
  const otherCommunityId = Id.generateUniqueId()
  const defaultDepositId = Id.generateUniqueId()

  const buildDeposit = (communityId: Id = defaultCommunityId) =>
    WaterDeposit.fromDto({
      id: defaultDepositId.toString(),
      name: 'Depósito Principal',
      location: '42.3406,-8.4523',
      notes: 'Notas originales',
      communityId: communityId.toString()
    })

  beforeEach(() => {
    mockWaterDepositRepository = createMockWaterDepositRepository()
    mockWaterDepositRepository.save = mock(() => Promise.resolve())
    service = new WaterDepositUpdater(mockWaterDepositRepository)
  })

  describe('Successful updates', () => {
    it('should update the name', async () => {
      // Arrange
      const deposit = buildDeposit()
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(deposit))

      // Act
      const result = await service.run({
        id: defaultDepositId,
        communityId: defaultCommunityId,
        updatedData: { name: 'Depósito Norte' }
      })

      // Assert
      expect(result.name).toBe('Depósito Norte')
      expect(mockWaterDepositRepository.save).toHaveBeenCalledTimes(1)
    })

    it('should update the location', async () => {
      // Arrange
      const deposit = buildDeposit()
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(deposit))

      // Act
      const result = await service.run({
        id: defaultDepositId,
        communityId: defaultCommunityId,
        updatedData: { location: 'Ramis' }
      })

      // Assert
      expect(result.location).toBe('Ramis')
    })

    it('should update the notes', async () => {
      // Arrange
      const deposit = buildDeposit()
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(deposit))

      // Act
      const result = await service.run({
        id: defaultDepositId,
        communityId: defaultCommunityId,
        updatedData: { notes: 'Tapa cambiada' }
      })

      // Assert
      expect(result.notes).toBe('Tapa cambiada')
    })

    it('should leave fields that were not provided untouched', async () => {
      // Arrange
      const deposit = buildDeposit()
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(deposit))

      // Act
      const result = await service.run({
        id: defaultDepositId,
        communityId: defaultCommunityId,
        updatedData: { name: 'Depósito Sur' }
      })

      // Assert
      expect(result.location).toBe('42.3406,-8.4523')
      expect(result.notes).toBe('Notas originales')
    })

    it('should trim the name and location', async () => {
      // Arrange
      const deposit = buildDeposit()
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(deposit))

      // Act
      const result = await service.run({
        id: defaultDepositId,
        communityId: defaultCommunityId,
        updatedData: { name: '  Depósito Sur  ', location: '  Casas Vellas  ' }
      })

      // Assert
      expect(result.name).toBe('Depósito Sur')
      expect(result.location).toBe('Casas Vellas')
    })
  })

  describe('Validation', () => {
    it('should throw when the deposit does not exist', async () => {
      // Arrange
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(undefined))

      // Act & Assert
      await expect(
        service.run({
          id: defaultDepositId,
          communityId: defaultCommunityId,
          updatedData: { name: 'Depósito Norte' }
        })
      ).rejects.toThrow('Water deposit not found')
      expect(mockWaterDepositRepository.save).not.toHaveBeenCalled()
    })

    it('should throw when the deposit belongs to another community', async () => {
      // Arrange
      const foreignDeposit = buildDeposit(otherCommunityId)
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(foreignDeposit))

      // Act & Assert
      await expect(
        service.run({
          id: defaultDepositId,
          communityId: defaultCommunityId,
          updatedData: { name: 'Secuestrado' }
        })
      ).rejects.toThrow('Water deposit does not belong to this community')
      expect(mockWaterDepositRepository.save).not.toHaveBeenCalled()
      expect(foreignDeposit.name).toBe('Depósito Principal')
    })

    it('should reject an empty name', async () => {
      // Arrange
      const deposit = buildDeposit()
      mockWaterDepositRepository.findById = mock(() => Promise.resolve(deposit))

      // Act & Assert
      await expect(
        service.run({
          id: defaultDepositId,
          communityId: defaultCommunityId,
          updatedData: { name: '   ' }
        })
      ).rejects.toThrow('Name cannot be empty')
      expect(mockWaterDepositRepository.save).not.toHaveBeenCalled()
    })
  })
})
