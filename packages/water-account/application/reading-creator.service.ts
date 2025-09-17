import type {
  CommunityRepository,
  CommunityZoneRepository,
  WaterPointRepository
} from '@pda/community'

import { differenceInDays } from 'date-fns'

import type { WaterMeterReading } from '../domain/entities/water-meter-reading'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'

export class ReadingCreatorService {
  constructor(
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly communityRepository: CommunityRepository,
    private readonly communityZoneRepository: CommunityZoneRepository,
    private readonly waterPointRepository: WaterPointRepository
  ) {}

  async run(params: { reading: WaterMeterReading }) {
    const { reading } = params
    const waterMeter = await this.waterMeterRepository.findById(reading.waterMeterId)
    if (!waterMeter) {
      throw new Error('Water meter not found')
    }

    const waterPoint = await this.waterPointRepository.findById(waterMeter.waterPointId)
    if (!waterPoint) {
      throw new Error('Water point not found')
    }

    const communityZone = await this.communityZoneRepository.findById(waterPoint.communityZoneId)
    if (!communityZone) {
      throw new Error('Community not found')
    }

    const community = await this.communityRepository.findById(communityZone.communityId)
    if (!community) {
      throw new Error('Community not found')
    }

    let waterLimitPerDay = 0
    const waterLimitRule = community.waterLimitRule
    if (waterLimitRule.getRuleType() === 'PERSON_BASED') {
      const numberOfPeople = waterPoint.fixedPopulation + waterPoint.floatingPopulation
      waterLimitPerDay = waterLimitRule.getValue() * numberOfPeople
    } else if (waterLimitRule.getRuleType() === 'HOUSEHOLD_BASED') {
      waterLimitPerDay = waterLimitRule.getValue()
    }

    const lastReading = await this.waterMeterReadingRepository.findLastReading(reading.waterMeterId)

    let dailyConsumption = 0
    if (!lastReading) {
      const totalDays = 365
      dailyConsumption = reading.normalizedReading / totalDays
    } else {
      const daysSinceLastReading = differenceInDays(reading.readingDate, lastReading.readingDate)
      if (daysSinceLastReading <= 0) {
        throw new Error('Days since last reading must be greater than 0')
      }
      dailyConsumption = reading.normalizedReading / daysSinceLastReading
    }

    const excessConsumption = dailyConsumption > waterLimitPerDay

    waterMeter.lastReadingNormalizedValue = reading.normalizedReading
    waterMeter.lastReadingDate = reading.readingDate
    waterMeter.lastReadingExcessConsumption = excessConsumption

    await this.waterMeterReadingRepository.save(reading)
    return reading
  }
}
