import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { WaterMeterLastReadingUpdater } from '../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingCreator } from '../application/water-meter-reading-creator.service'
import { WaterMeter, WaterMeterReading } from '../domain'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'

describe('WaterMeterReadingCreator', () => {
  let service: WaterMeterReadingCreator
  let mockWaterMeterRepository: WaterMeterRepository
  let mockWaterMeterReadingRepository: WaterMeterReadingRepository
  let mockWaterMeterLastReadingUpdater: WaterMeterLastReadingUpdater

  // Default test entities
  const defaultWaterMeterLiters = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter (L)',
    waterAccountId: Id.generateUniqueId().toString(),
    waterPointId: Id.generateUniqueId().toString(),
    measurementUnit: 'L',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: true
  })

  const defaultWaterMeterCubicMeters = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter (M3)',
    waterAccountId: Id.generateUniqueId().toString(),
    waterPointId: Id.generateUniqueId().toString(),
    measurementUnit: 'M3',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: true
  })

  const defaultLastReading = WaterMeterReading.fromDto({
    id: Id.generateUniqueId().toString(),
    waterMeterId: defaultWaterMeterLiters.id.toString(),
    reading: '5000',
    normalizedReading: 5000,
    readingDate: new Date(Date.now() - 86400000), // 1 day ago
    notes: 'Previous reading'
  })

  beforeEach(() => {
    mockWaterMeterRepository = {
      findById: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as WaterMeterRepository

    mockWaterMeterReadingRepository = {
      findLastReading: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as WaterMeterReadingRepository

    mockWaterMeterLastReadingUpdater = {
      run: mock()
    } as unknown as WaterMeterLastReadingUpdater

    service = new WaterMeterReadingCreator(
      mockWaterMeterLastReadingUpdater,
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository
    )
  })

  it('should throw error if provided date is in the future', async () => {
    // Arrange
    const futureDate = new Date(Date.now() + 86400000) // 1 day in the future
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeterLiters)

    // Act & Assert
    await expect(
      service.run({ waterMeterId: Id.generateUniqueId(), reading: '1000', date: futureDate })
    ).rejects.toThrow('Reading date cannot be in the future')

    // Verify repository call
    expect(mockWaterMeterRepository.findById).toHaveBeenCalled()
  })

  it('should throw error if water meter not found', async () => {
    // Arrange
    mockWaterMeterRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(
      service.run({ waterMeterId: Id.generateUniqueId(), reading: '1000' })
    ).rejects.toThrow('Water meter not found')

    // Verify repository call
    expect(mockWaterMeterRepository.findById).toHaveBeenCalled()
  })

  it('should throw error if new reading is lower than last reading', async () => {
    // Arrange
    mockWaterMeterRepository.findById = mock().mockResolvedValue(defaultWaterMeterLiters)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(defaultLastReading)

    // Act & Assert
    await expect(
      service.run({ waterMeterId: defaultWaterMeterLiters.id, reading: '1000' })
    ).rejects.toThrow('New reading is lower than last reading')

    // Verify repository call
    expect(mockWaterMeterRepository.findById).toHaveBeenCalled()
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalled()
  })

  it('should create reading with liters measurement unit and normalize correctly', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterLiters
    const reading = '15000' // 15k liters

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading,
      notes: 'Test reading'
    })

    // Assert
    expect(result).toBeInstanceOf(WaterMeterReading)
    expect(result.waterMeterId.toString()).toBe(waterMeter.id.toString())
    expect(result.reading.toString()).toBe(reading)
    expect(result.normalizedReading).toBe(waterMeter.measurementUnit.normalize(result.reading))
    expect(result.notes).toBe('Test reading')
    expect(result.readingDate).toBeInstanceOf(Date)

    // Verify repository calls
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(result)
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [result])
  })

  it('should create reading with cubic meters measurement unit and normalize correctly', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterCubicMeters
    const reading = '15' // 15 cubic meters

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading,
      notes: 'Test reading M3'
    })

    // Assert
    expect(result.normalizedReading).toBe(waterMeter.measurementUnit.normalize(result.reading))
    expect(result.normalizedReading).toBe(15000)

    // Verify repository calls
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalledWith(waterMeter.id)
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(result)
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [result])
  })

  it('should create reading with existing last reading', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterLiters
    const lastReading = defaultLastReading
    const reading = '20000'

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading,
      notes: 'New reading with last reading'
    })

    // Assert
    expect(result).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.toString()).toBe(reading)
    expect(result.normalizedReading).toBe(waterMeter.measurementUnit.normalize(result.reading))

    // Verify that both last reading and new reading are passed to updater
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [
      lastReading,
      result
    ])
  })

  it('should create reading without existing last reading', async () => {
    // Arrange
    const waterMeter = defaultWaterMeterLiters
    const reading = '10000'

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(undefined)
    mockWaterMeterLastReadingUpdater.run = mock().mockResolvedValue(waterMeter)

    // Act
    const result = await service.run({
      waterMeterId: waterMeter.id,
      reading
    })

    // Assert
    expect(result).toBeInstanceOf(WaterMeterReading)
    expect(result.reading.toString()).toBe(reading)
    expect(result.notes).toBeNull()

    // Verify that only new reading is passed to updater
    expect(mockWaterMeterLastReadingUpdater.run).toHaveBeenCalledWith(waterMeter, [result])
  })
})
