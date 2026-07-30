import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterDepositCreator } from '../application/water-deposit-creator.service'
import { WaterDeposit } from '../domain/entities/water-deposit'
import type { WaterDepositRepository } from '../domain/repositories/water-deposit.repository'
import { createMockWaterDepositRepository } from './helpers/mocks'

describe('WaterDepositCreator', () => {
  let service: WaterDepositCreator
  let mockWaterDepositRepository: WaterDepositRepository

  const defaultCommunityId = Id.generateUniqueId()

  const buildDeposit = (overrides: { name?: string; location?: string; notes?: string } = {}) =>
    WaterDeposit.create({
      name: overrides.name ?? 'Depósito Principal',
      location: overrides.location ?? '42.3406,-8.4523',
      notes: overrides.notes,
      communityId: defaultCommunityId.toString()
    })

  beforeEach(() => {
    mockWaterDepositRepository = createMockWaterDepositRepository()
    mockWaterDepositRepository.save = mock(() => Promise.resolve())
    service = new WaterDepositCreator(mockWaterDepositRepository)
  })

  describe('Successful creation', () => {
    it('should save the deposit and return it', async () => {
      // Arrange
      const deposit = buildDeposit()

      // Act
      const result = await service.run({ deposit })

      // Assert
      expect(mockWaterDepositRepository.save).toHaveBeenCalledTimes(1)
      expect(mockWaterDepositRepository.save).toHaveBeenCalledWith(deposit)
      expect(result.name).toBe('Depósito Principal')
      expect(result.communityId.toString()).toBe(defaultCommunityId.toString())
    })

    it('should trim the name and location before saving', async () => {
      // Arrange
      const deposit = buildDeposit({ name: '  Depósito Reserva  ', location: '  A Cañiza  ' })

      // Act
      const result = await service.run({ deposit })

      // Assert
      expect(result.name).toBe('Depósito Reserva')
      expect(result.location).toBe('A Cañiza')
    })

    it('should keep notes untouched', async () => {
      // Arrange
      const deposit = buildDeposit({ notes: 'Revisar la tapa' })

      // Act
      const result = await service.run({ deposit })

      // Assert
      expect(result.notes).toBe('Revisar la tapa')
    })
  })

  describe('Validation', () => {
    it('should reject an empty name', async () => {
      // Arrange
      const deposit = buildDeposit({ name: '' })

      // Act & Assert
      await expect(service.run({ deposit })).rejects.toThrow('Name cannot be empty')
      expect(mockWaterDepositRepository.save).not.toHaveBeenCalled()
    })

    it('should reject a whitespace-only name', async () => {
      // Arrange
      const deposit = buildDeposit({ name: '   ' })

      // Act & Assert
      await expect(service.run({ deposit })).rejects.toThrow('Name cannot be empty')
      expect(mockWaterDepositRepository.save).not.toHaveBeenCalled()
    })
  })
})
