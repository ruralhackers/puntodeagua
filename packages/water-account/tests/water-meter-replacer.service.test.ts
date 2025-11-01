import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { WaterMeterReadingCreator } from '../application/water-meter-reading-creator.service'
import { WaterMeterReplacer } from '../application/water-meter-replacer.service'
import { WaterMeter } from '../domain'
import {
  WaterMeterInactiveError,
  WaterMeterNotFoundError,
  WaterMeterReadingDateNotAllowedError
} from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import { createMockWaterMeterRepository } from './helpers/mocks'

describe('WaterMeterReplacer', () => {
  let service: WaterMeterReplacer
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterMeterReadingCreator: WaterMeterReadingCreator

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

  const defaultOldWaterMeter = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Old Water Meter',
    waterAccountId: Id.generateUniqueId().toString(),
    measurementUnit: 'L',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date('2024-01-01'),
    lastReadingExcessConsumption: false,
    isActive: true,
    waterPoint: defaultWaterPoint
  })

  beforeEach(() => {
    mockWaterMeterRepository = createMockWaterMeterRepository()
    mockWaterMeterReadingCreator = {
      run: mock()
    } as unknown as WaterMeterReadingCreator

    service = new WaterMeterReplacer(mockWaterMeterRepository, mockWaterMeterReadingCreator)
  })

  describe('Successful replacement', () => {
    it('should successfully replace a water meter without final reading', async () => {
      // Arrange
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      const result = await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'L'
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.oldWaterMeterId).toBe(oldWaterMeter.id.toString())
      expect(result.newWaterMeterId).toBeDefined()
      expect(result.finalReadingCreated).toBe(false)
      expect(result.initialReadingCreated).toBe(true)

      // Verify the old meter was deactivated
      expect(mockWaterMeterRepository.save).toHaveBeenCalledTimes(2) // Once for deactivation, once for new meter

      // Verify initial reading was created
      expect(mockWaterMeterReadingCreator.run).toHaveBeenCalledTimes(1)
      expect(mockWaterMeterReadingCreator.run).toHaveBeenCalledWith(
        expect.objectContaining({
          reading: '0',
          notes: 'Lectura inicial del nuevo contador'
        })
      )
    })

    it('should successfully replace a water meter with final reading', async () => {
      // Arrange
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      const result = await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'L',
        finalReading: '1500'
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.finalReadingCreated).toBe(true)
      expect(result.initialReadingCreated).toBe(true)

      // Verify final reading was created
      expect(mockWaterMeterReadingCreator.run).toHaveBeenCalledTimes(2) // Final + initial
      expect(mockWaterMeterReadingCreator.run).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          waterMeterId: oldWaterMeter.id,
          reading: '1500',
          notes: 'Lectura final antes del reemplazo del contador'
        })
      )
      expect(mockWaterMeterReadingCreator.run).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          reading: '0',
          notes: 'Lectura inicial del nuevo contador'
        })
      )
    })

    it('should replace water meter with custom replacement date', async () => {
      // Arrange
      const replacementDate = new Date('2024-06-01')
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      const result = await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'L',
        replacementDate
      })

      // Assert
      expect(result).toBeDefined()

      // Verify the replacement date was used
      expect(mockWaterMeterReadingCreator.run).toHaveBeenCalledWith(
        expect.objectContaining({
          date: replacementDate
        })
      )
    })

    it('should replace water meter with different measurement unit', async () => {
      // Arrange
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      const result = await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'M3'
      })

      // Assert
      expect(result).toBeDefined()
      expect(mockWaterMeterRepository.save).toHaveBeenCalledTimes(2)

      // Verify the new meter was created with the correct measurement unit
      const savedNewMeter = (mockWaterMeterRepository.save as any).mock.calls[1][0] as WaterMeter
      expect(savedNewMeter.measurementUnit.toString()).toBe('M3')
    })
  })

  describe('Error handling', () => {
    it('should throw WaterMeterNotFoundError when water meter does not exist', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(undefined))

      // Act & Assert
      await expect(
        service.run({
          oldWaterMeterId: Id.generateUniqueId(),
          newWaterMeterName: 'New Water Meter',
          measurementUnit: 'L'
        })
      ).rejects.toThrow(WaterMeterNotFoundError)
    })

    it('should throw WaterMeterInactiveError when water meter is already inactive', async () => {
      // Arrange
      const inactiveWaterMeter = WaterMeter.fromDto({
        ...defaultOldWaterMeter.toDto(),
        isActive: false
      })
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(inactiveWaterMeter))

      // Act & Assert
      await expect(
        service.run({
          oldWaterMeterId: inactiveWaterMeter.id,
          newWaterMeterName: 'New Water Meter',
          measurementUnit: 'L'
        })
      ).rejects.toThrow(WaterMeterInactiveError)
    })

    it('should throw WaterMeterReadingDateNotAllowedError when replacement date is in the future', async () => {
      // Arrange
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultOldWaterMeter))

      // Act & Assert
      await expect(
        service.run({
          oldWaterMeterId: defaultOldWaterMeter.id,
          newWaterMeterName: 'New Water Meter',
          measurementUnit: 'L',
          replacementDate: futureDate
        })
      ).rejects.toThrow(WaterMeterReadingDateNotAllowedError)
    })

    it('should throw error when measurement unit is invalid', async () => {
      // Arrange
      mockWaterMeterRepository.findById = mock(() => Promise.resolve(defaultOldWaterMeter))

      // Act & Assert
      await expect(
        service.run({
          oldWaterMeterId: defaultOldWaterMeter.id,
          newWaterMeterName: 'New Water Meter',
          measurementUnit: 'INVALID'
        })
      ).rejects.toThrow()
    })
  })

  describe('Verification of side effects', () => {
    it('should deactivate the old water meter', async () => {
      // Arrange
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'L'
      })

      // Assert - first save should be the deactivated old meter
      const deactivatedMeter = (mockWaterMeterRepository.save as any).mock.calls[0][0] as WaterMeter
      expect(deactivatedMeter.isActive).toBe(false)
      expect(deactivatedMeter.id.toString()).toBe(oldWaterMeter.id.toString())
    })

    it('should create new water meter with correct properties', async () => {
      // Arrange
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'L'
      })

      // Assert - second save should be the new meter
      const newMeter = (mockWaterMeterRepository.save as any).mock.calls[1][0] as WaterMeter
      expect(newMeter.name).toBe('New Water Meter')
      expect(newMeter.isActive).toBe(true)
      expect(newMeter.waterAccountId.toString()).toBe(oldWaterMeter.waterAccountId.toString())
      expect(newMeter.waterPoint.id.toString()).toBe(oldWaterMeter.waterPoint.id.toString())
    })

    it('should create initial reading with value 0', async () => {
      // Arrange
      const oldWaterMeter = WaterMeter.fromDto({
        id: Id.generateUniqueId().toString(),
        name: 'Old Water Meter',
        waterAccountId: Id.generateUniqueId().toString(),
        measurementUnit: 'L',
        lastReadingNormalizedValue: 1000,
        lastReadingDate: new Date('2024-01-01'),
        lastReadingExcessConsumption: false,
        isActive: true,
        waterPoint: defaultWaterPoint
      })

      mockWaterMeterRepository.findById = mock(() => Promise.resolve(oldWaterMeter))
      mockWaterMeterRepository.save = mock(() => Promise.resolve())
      mockWaterMeterReadingCreator.run = mock(() => Promise.resolve({ reading: {} } as any))

      // Act
      await service.run({
        oldWaterMeterId: oldWaterMeter.id,
        newWaterMeterName: 'New Water Meter',
        measurementUnit: 'L'
      })

      // Assert
      const lastCallArgs = (mockWaterMeterReadingCreator.run as any).mock.calls.slice(-1)[0][0]
      expect(lastCallArgs.reading).toBe('0')
      expect(lastCallArgs.notes).toBe('Lectura inicial del nuevo contador')
    })
  })
})
