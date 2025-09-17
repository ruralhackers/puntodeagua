import { beforeEach, describe, expect, it, mock, xit } from 'bun:test'
import { Id } from '@pda/common/domain'
import {
  Community,
  type CommunityRepository,
  CommunityZone,
  type CommunityZoneRepository,
  WaterPoint,
  type WaterPointRepository
} from '@pda/community'
import { WaterMeterLastReadingUpdater } from '../application/water-meter-last-reading-updater.service'
import { WaterMeter, WaterMeterReading } from '../domain'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'

describe('ReadingCreatorService', () => {
  let service: WaterMeterLastReadingUpdater
  let mockWaterMeterRepository: WaterMeterRepository
  let mockCommunityRepository: CommunityRepository
  let mockCommunityZoneRepository: CommunityZoneRepository
  let mockWaterPointRepository: WaterPointRepository

  // Default test entities
  const defaultWaterPoint = WaterPoint.fromDto({
    id: Id.generateUniqueId().toString(),
    communityZoneId: Id.generateUniqueId().toString(),
    name: 'Test Water Point',
    location: 'Test location',
    cadastralReference: 'Test cadastral reference',
    fixedPopulation: 10,
    floatingPopulation: 5
  })

  const defaultCommunityZone = CommunityZone.fromDto({
    id: Id.generateUniqueId().toString(),
    communityId: Id.generateUniqueId().toString(),
    name: 'Test Community Zone',
    notes: 'Test community zone'
  })

  const defaultCommunity = Community.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Community',
    waterLimitRule: {
      type: 'PERSON_BASED',
      value: 100
    }
  })

  const defaultWaterMeter = WaterMeter.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test Water Meter',
    waterAccountId: Id.generateUniqueId().toString(),
    waterPointId: Id.generateUniqueId().toString(),
    measurementUnit: 'L',
    lastReadingNormalizedValue: 1000,
    lastReadingDate: new Date(),
    lastReadingExcessConsumption: true
  })

  const now = new Date()
  const tenDaysAgo = new Date()
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

  beforeEach(() => {
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

    service = new WaterMeterLastReadingUpdater(
      mockWaterMeterRepository,
      mockCommunityRepository,
      mockCommunityZoneRepository,
      mockWaterPointRepository
    )
  })

  it('should update the last reading with excess consumption true with person based water limit rule', async () => {
    // Arrange
    const waterMeter = defaultWaterMeter
    const waterPoint = defaultWaterPoint //15 people, 100 liters per person per day -> 1500 liters per day
    const communityZone = defaultCommunityZone
    const community = defaultCommunity

    const lastReadings = [
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 18000,
        normalizedReading: 18000,
        readingDate: now,
        notes: 'Test reading'
      }),
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 1000,
        normalizedReading: 1000,
        readingDate: tenDaysAgo,
        notes: 'Test reading'
      })
    ]

    // Update mocks with default entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterRepository.save = mock().mockResolvedValue(waterMeter)

    // Act
    const resultWaterMeter = await service.run(waterMeter, lastReadings)

    // Assert
    expect(resultWaterMeter).toBe(waterMeter)
    expect(resultWaterMeter.lastReadingNormalizedValue).toBe(18000)
    expect(resultWaterMeter.lastReadingDate).toBe(lastReadings?.[0]?.readingDate)
    expect(resultWaterMeter.lastReadingExcessConsumption).toBe(true)
  })

  it('should update the last reading with excess consumption false with person based water limit rule', async () => {
    // Arrange
    const waterMeter = defaultWaterMeter
    const waterPoint = defaultWaterPoint //15 people, 100 liters per person per day -> 1500 liters per day
    const communityZone = defaultCommunityZone
    const community = defaultCommunity

    const lastReadings = [
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 15000,
        normalizedReading: 15000,
        readingDate: now,
        notes: 'Test reading'
      }),
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 1000,
        normalizedReading: 1000,
        readingDate: tenDaysAgo,
        notes: 'Test reading'
      })
    ]

    // Update mocks with default entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterRepository.save = mock().mockResolvedValue(waterMeter)

    // Act
    const resultWaterMeter = await service.run(waterMeter, lastReadings)

    // Assert
    expect(resultWaterMeter).toBe(waterMeter)
    expect(resultWaterMeter.lastReadingNormalizedValue).toBe(15000)
    expect(resultWaterMeter.lastReadingDate).toBe(lastReadings?.[0]?.readingDate)
    expect(resultWaterMeter.lastReadingExcessConsumption).toBe(false)
  })

  it('should update the last reading with excess consumption true with household based water limit rule', async () => {
    // Arrange
    const waterMeter = defaultWaterMeter
    const waterPoint = defaultWaterPoint
    const communityZone = defaultCommunityZone
    const community = Community.fromDto({
      id: Id.generateUniqueId().toString(),
      name: 'Test Community',
      waterLimitRule: {
        type: 'HOUSEHOLD_BASED',
        value: 1000
      }
    })

    const lastReadings = [
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 12000,
        normalizedReading: 12000,
        readingDate: now,
        notes: 'Test reading'
      }),
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 1000,
        normalizedReading: 1000,
        readingDate: tenDaysAgo,
        notes: 'Test reading'
      })
    ]
    // Update mocks with default entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterRepository.save = mock().mockResolvedValue(waterMeter)

    // Act
    const resultWaterMeter = await service.run(waterMeter, lastReadings)

    // Assert
    expect(resultWaterMeter).toBe(waterMeter)
    expect(resultWaterMeter.lastReadingNormalizedValue).toBe(12000)
    expect(resultWaterMeter.lastReadingDate).toBe(lastReadings?.[0]?.readingDate)
    expect(resultWaterMeter.lastReadingExcessConsumption).toBe(true)
  })

  it('should update the last reading with excess consumption true with household based water limit rule', async () => {
    // Arrange
    const waterMeter = defaultWaterMeter
    const waterPoint = defaultWaterPoint
    const communityZone = defaultCommunityZone
    const community = Community.fromDto({
      id: Id.generateUniqueId().toString(),
      name: 'Test Community',
      waterLimitRule: {
        type: 'HOUSEHOLD_BASED',
        value: 1000
      }
    })

    const lastReadings = [
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 10000,
        normalizedReading: 10000,
        readingDate: now,
        notes: 'Test reading'
      }),
      WaterMeterReading.fromDto({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id.toString(),
        reading: 1000,
        normalizedReading: 1000,
        readingDate: tenDaysAgo,
        notes: 'Test reading'
      })
    ]
    // Update mocks with default entities
    mockWaterPointRepository.findById = mock().mockResolvedValue(waterPoint)
    mockCommunityZoneRepository.findById = mock().mockResolvedValue(communityZone)
    mockCommunityRepository.findById = mock().mockResolvedValue(community)
    mockWaterMeterRepository.save = mock().mockResolvedValue(waterMeter)

    // Act
    const resultWaterMeter = await service.run(waterMeter, lastReadings)

    // Assert
    expect(resultWaterMeter).toBe(waterMeter)
    expect(resultWaterMeter.lastReadingNormalizedValue).toBe(10000)
    expect(resultWaterMeter.lastReadingDate).toBe(lastReadings?.[0]?.readingDate)
    expect(resultWaterMeter.lastReadingExcessConsumption).toBe(false)
  })
})
