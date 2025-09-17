import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { ReadingCreatorService } from '../application/reading-creator.service'
import { WaterMeterReading } from '../domain/entities/water-meter-reading'
import { WaterMeter } from '../domain/entities/water-meter'
import { WaterPoint } from '@pda/community/domain/entities/water-point'
import { CommunityZone } from '@pda/community/domain/entities/community-zone'
import { Community } from '@pda/community/domain/entities/community'
import { Id } from '@pda/common/domain'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { CommunityRepository } from '@pda/community/domain/repositories/community.repository'
import type { CommunityZoneRepository } from '@pda/community/domain/repositories/community-zone.repository'
import type { WaterPointRepository } from '@pda/community/domain/repositories/water-point.repository'

describe('ReadingCreatorService', () => {
  let service: ReadingCreatorService
  let mockWaterMeterReadingRepository: WaterMeterReadingRepository
  let mockWaterMeterRepository: WaterMeterRepository
  let mockCommunityRepository: CommunityRepository
  let mockCommunityZoneRepository: CommunityZoneRepository
  let mockWaterPointRepository: WaterPointRepository

  // Test data factory
  const createTestIds = () => ({
    waterMeterId: Id.generateUniqueId(),
    waterPointId: Id.generateUniqueId(),
    communityZoneId: Id.generateUniqueId(),
    communityId: Id.generateUniqueId()
  })

  const createWaterMeterReading = (
    overrides: Partial<{
      waterMeterId: string
      reading: number
      normalizedReading: number
      readingDate: Date
      notes: string
    }> = {}
  ) => {
    const ids = createTestIds()
    return WaterMeterReading.create({
      waterMeterId: overrides.waterMeterId || ids.waterMeterId.toString(),
      reading: overrides.reading || 1000,
      normalizedReading: overrides.normalizedReading || 1000,
      readingDate: overrides.readingDate || new Date('2024-01-15'),
      notes: overrides.notes || 'Test reading'
    })
  }

  const createWaterMeter = (waterPointId: string) =>
    WaterMeter.create({
      name: 'Test Water Meter',
      waterAccountId: Id.generateUniqueId().toString(),
      waterPointId,
      measurementUnit: 'L'
    })

  const createWaterPoint = (
    communityZoneId: string,
    population: { fixed: number; floating: number } = { fixed: 5, floating: 3 }
  ) =>
    WaterPoint.create({
      name: 'Test Water Point',
      location: 'Test Location',
      fixedPopulation: population.fixed,
      floatingPopulation: population.floating,
      cadastralReference: 'REF123',
      communityZoneId,
      notes: 'Test water point'
    })

  const createCommunityZone = (communityId: string) =>
    CommunityZone.create({
      name: 'Test Zone',
      communityId,
      notes: 'Test zone'
    })

  const createCommunity = (waterLimitRule: { type: string; value: number }) =>
    Community.create({
      name: 'Test Community',
      waterLimitRule
    })

  const setupMocks = (
    overrides: {
      waterMeter?: WaterMeter | null
      waterPoint?: WaterPoint | null
      communityZone?: CommunityZone | null
      community?: Community | null
      lastReading?: WaterMeterReading | null
      reading?: WaterMeterReading
    } = {}
  ) => {
    const ids = createTestIds()
    const waterMeter = overrides.waterMeter || createWaterMeter(ids.waterPointId.toString())
    const waterPoint = overrides.waterPoint || createWaterPoint(ids.communityZoneId.toString())
    const communityZone = overrides.communityZone || createCommunityZone(ids.communityId.toString())
    const community = overrides.community || createCommunity({ type: 'PERSON_BASED', value: 50 })
    const lastReading = overrides.lastReading
    const reading =
      overrides.reading || createWaterMeterReading({ waterMeterId: ids.waterMeterId.toString() })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(reading)

    return { ids, waterMeter, waterPoint, communityZone, community, lastReading, reading }
  }

  beforeEach(() => {
    // Create mock repositories
    mockWaterMeterReadingRepository = {
      findById: mock(),
      findLastReading: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as WaterMeterReadingRepository

    mockWaterMeterRepository = {
      findById: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as WaterMeterRepository

    mockCommunityRepository = {
      findById: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as CommunityRepository

    mockCommunityZoneRepository = {
      findById: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as CommunityZoneRepository

    mockWaterPointRepository = {
      findById: mock(),
      save: mock(),
      findAll: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as WaterPointRepository

    service = new ReadingCreatorService(
      mockWaterMeterReadingRepository,
      mockWaterMeterRepository,
      mockCommunityRepository,
      mockCommunityZoneRepository,
      mockWaterPointRepository
    )
  })

  it('should process reading successfully with person-based water limit and no excess consumption', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()

    // Override specific entities for this test
    const customWaterPoint = createWaterPoint(ids.communityZoneId.toString(), {
      fixed: 5,
      floating: 3
    })
    const customCommunity = createCommunity({ type: 'PERSON_BASED', value: 50 })
    const customLastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-10'), // 5 days ago
      notes: 'Previous reading'
    })
    const customReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-15'),
      notes: 'Test reading'
    })

    // Update mocks with custom entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(customWaterPoint)
    mockCommunityRepository.findById = mock().mockResolvedValue(customCommunity)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(customLastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(customReading)

    // Act
    const result = await service.run({ reading: customReading })

    // Assert
    expect(result).toBe(customReading)

    // Verify repository calls
    expect(mockWaterMeterRepository.findById).toHaveBeenCalledWith(ids.waterMeterId)
    expect(mockWaterPointRepository.findById).toHaveBeenCalledWith(ids.waterPointId)
    expect(mockCommunityZoneRepository.findById).toHaveBeenCalledWith(ids.communityZoneId)
    expect(mockCommunityRepository.findById).toHaveBeenCalledWith(ids.communityId)
    expect(mockWaterMeterReadingRepository.findLastReading).toHaveBeenCalledWith(ids.waterMeterId)
    expect(mockWaterMeterReadingRepository.save).toHaveBeenCalledWith(customReading)

    // Verify water meter updates
    // Expected: 8 people * 50 liters = 400 liters per day limit
    // Actual: 1000 liters / 5 days = 200 liters per day
    // Since 200 < 400, no excess consumption
    expect(waterMeter.lastReadingNormalizedValue).toBe(1000)
    expect(waterMeter.lastReadingDate).toBe(customReading.readingDate)
    expect(waterMeter.lastReadingExcessConsumption).toBe(false)
  })

  it('should process reading with person-based water limit and excess consumption', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()

    // Override specific entities for this test
    const customWaterPoint = createWaterPoint(ids.communityZoneId.toString(), {
      fixed: 2,
      floating: 1
    })
    const customCommunity = createCommunity({ type: 'PERSON_BASED', value: 100 })
    const customLastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-10'), // 5 days ago
      notes: 'Previous reading'
    })
    const customReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 3000,
      normalizedReading: 3000,
      readingDate: new Date('2024-01-15'),
      notes: 'High consumption reading'
    })

    // Update mocks with custom entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(customWaterPoint)
    mockCommunityRepository.findById = mock().mockResolvedValue(customCommunity)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(customLastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(customReading)

    // Act
    const result = await service.run({ reading: customReading })

    // Assert
    expect(result).toBe(customReading)

    // Verify water meter updates
    // Expected: 3 people * 100 liters = 300 liters per day limit
    // Actual: 3000 liters / 5 days = 600 liters per day
    // Since 600 > 300, excess consumption
    expect(waterMeter.lastReadingNormalizedValue).toBe(3000)
    expect(waterMeter.lastReadingDate).toBe(customReading.readingDate)
    expect(waterMeter.lastReadingExcessConsumption).toBe(true)
  })

  it('should process reading with household-based water limit', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()

    // Override specific entities for this test
    const customWaterPoint = createWaterPoint(ids.communityZoneId.toString(), {
      fixed: 10,
      floating: 5
    })
    const customCommunity = createCommunity({ type: 'HOUSEHOLD_BASED', value: 200 })
    const customLastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-10'), // 5 days ago
      notes: 'Previous reading'
    })
    const customReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1500,
      normalizedReading: 1500,
      readingDate: new Date('2024-01-15'),
      notes: 'Household reading'
    })

    // Update mocks with custom entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(customWaterPoint)
    mockCommunityRepository.findById = mock().mockResolvedValue(customCommunity)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(customLastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(customReading)

    // Act
    const result = await service.run({ reading: customReading })

    // Assert
    expect(result).toBe(customReading)

    // Verify water meter updates
    // Expected: 200 liters per household per day (population doesn't matter)
    // Actual: 1500 liters / 5 days = 300 liters per day
    // Since 300 > 200, excess consumption
    expect(waterMeter.lastReadingNormalizedValue).toBe(1500)
    expect(waterMeter.lastReadingDate).toBe(customReading.readingDate)
    expect(waterMeter.lastReadingExcessConsumption).toBe(true)
  })

  it('should process first reading with no previous reading', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()

    // Override specific entities for this test
    const customWaterPoint = createWaterPoint(ids.communityZoneId.toString(), {
      fixed: 4,
      floating: 2
    })
    const customCommunity = createCommunity({ type: 'PERSON_BASED', value: 50 })
    const customReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 10000,
      normalizedReading: 10000,
      readingDate: new Date('2024-01-15'),
      notes: 'First reading'
    })

    // Update mocks with custom entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(customWaterPoint)
    mockCommunityRepository.findById = mock().mockResolvedValue(customCommunity)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(null) // No previous reading
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(customReading)

    // Act
    const result = await service.run({ reading: customReading })

    // Assert
    expect(result).toBe(customReading)

    // Verify water meter updates
    // Expected: 6 people * 50 liters = 300 liters per day limit
    // Actual: 10000 liters / 365 days = 27.4 liters per day
    // Since 27.4 < 300, no excess consumption
    expect(waterMeter.lastReadingNormalizedValue).toBe(10000)
    expect(waterMeter.lastReadingDate).toBe(customReading.readingDate)
    expect(waterMeter.lastReadingExcessConsumption).toBe(false)
  })

  it('should throw error when water meter is not found', async () => {
    // Arrange
    const { ids } = setupMocks()
    const reading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-15'),
      notes: 'Test reading'
    })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run({ reading })).rejects.toThrow('Water meter not found')
  })

  it('should throw error when water point is not found', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()
    const reading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-15'),
      notes: 'Test reading'
    })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterPointRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run({ reading })).rejects.toThrow('Water point not found')
  })

  it('should throw error when community zone is not found', async () => {
    // Arrange
    const { ids, waterMeter, waterPoint } = setupMocks()
    const reading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-15'),
      notes: 'Test reading'
    })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run({ reading })).rejects.toThrow('Community not found')
  })

  it('should throw error when community is not found', async () => {
    // Arrange
    const { ids, waterMeter, waterPoint, communityZone } = setupMocks()
    const reading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-15'),
      notes: 'Test reading'
    })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(null)

    // Act & Assert
    await expect(service.run({ reading })).rejects.toThrow('Community not found')
  })

  it('should throw error when reading date is same as last reading date', async () => {
    // Arrange
    const { ids, waterMeter, waterPoint, communityZone, community } = setupMocks()
    const sameDate = new Date('2024-01-15')

    const reading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: sameDate,
      notes: 'Test reading'
    })

    const lastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: sameDate, // Same date
      notes: 'Previous reading'
    })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)

    // Act & Assert
    await expect(service.run({ reading })).rejects.toThrow(
      'Days since last reading must be greater than 0'
    )
  })

  it('should throw error when reading date is before last reading date', async () => {
    // Arrange
    const { ids, waterMeter, waterPoint, communityZone, community } = setupMocks()

    const reading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-10'), // Before last reading
      notes: 'Test reading'
    })

    const lastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-15'), // After current reading
      notes: 'Previous reading'
    })

    mockWaterMeterRepository.findById = mock().mockResolvedValue(waterMeter)
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(lastReading)

    // Act & Assert
    await expect(service.run({ reading })).rejects.toThrow(
      'Days since last reading must be greater than 0'
    )
  })

  it('should handle zero population correctly', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()

    // Override specific entities for this test
    const customWaterPoint = createWaterPoint(ids.communityZoneId.toString(), {
      fixed: 0,
      floating: 0
    })
    const customCommunity = createCommunity({ type: 'PERSON_BASED', value: 50 })
    const customLastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-10'), // 5 days ago
      notes: 'Previous reading'
    })
    const customReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 1000,
      normalizedReading: 1000,
      readingDate: new Date('2024-01-15'),
      notes: 'Zero population reading'
    })

    // Update mocks with custom entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(customWaterPoint)
    mockCommunityRepository.findById = mock().mockResolvedValue(customCommunity)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(customLastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(customReading)

    // Act
    const result = await service.run({ reading: customReading })

    // Assert
    expect(result).toBe(customReading)

    // Verify water meter updates
    // Expected: 0 people * 50 liters = 0 liters per day limit
    // Actual: 1000 liters / 5 days = 200 liters per day
    // Since 200 > 0, excess consumption
    expect(waterMeter.lastReadingNormalizedValue).toBe(1000)
    expect(waterMeter.lastReadingDate).toBe(customReading.readingDate)
    expect(waterMeter.lastReadingExcessConsumption).toBe(true)
  })

  it('should handle zero consumption correctly', async () => {
    // Arrange
    const { ids, waterMeter } = setupMocks()

    // Override specific entities for this test
    const customWaterPoint = createWaterPoint(ids.communityZoneId.toString(), {
      fixed: 5,
      floating: 3
    })
    const customCommunity = createCommunity({ type: 'PERSON_BASED', value: 50 })
    const customLastReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-10'), // 5 days ago
      notes: 'Previous reading'
    })
    const customReading = createWaterMeterReading({
      waterMeterId: ids.waterMeterId.toString(),
      reading: 500,
      normalizedReading: 500,
      readingDate: new Date('2024-01-15'),
      notes: 'No consumption reading'
    })

    // Update mocks with custom entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(customWaterPoint)
    mockCommunityRepository.findById = mock().mockResolvedValue(customCommunity)
    mockWaterMeterReadingRepository.findLastReading = mock().mockResolvedValue(customLastReading)
    mockWaterMeterReadingRepository.save = mock().mockResolvedValue(customReading)

    // Act
    const result = await service.run({ reading: customReading })

    // Assert
    expect(result).toBe(customReading)

    // Verify water meter updates
    // Expected: 8 people * 50 liters = 400 liters per day limit
    // Actual: 0 liters / 5 days = 0 liters per day (no consumption)
    // Since 0 < 400, no excess consumption
    expect(waterMeter.lastReadingNormalizedValue).toBe(500)
    expect(waterMeter.lastReadingDate).toBe(customReading.readingDate)
    expect(waterMeter.lastReadingExcessConsumption).toBe(false)
  })
})
