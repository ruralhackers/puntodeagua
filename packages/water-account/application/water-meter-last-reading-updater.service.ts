import type {
  CommunityRepository,
  CommunityZoneRepository,
  WaterPointRepository
} from '@pda/community'
import { differenceInDays } from 'date-fns'
import type { WaterMeter } from '../domain'
import type { WaterMeterReading } from '../domain/entities/water-meter-reading'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'

export class WaterMeterLastReadingUpdater {
  constructor(
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly communityRepository: CommunityRepository,
    private readonly communityZoneRepository: CommunityZoneRepository,
    private readonly waterPointRepository: WaterPointRepository
  ) {}

  async run(waterMeter: WaterMeter, lastReadings: WaterMeterReading[]) {
    const [latestReading, secondLatestReading] = lastReadings.sort(
      (a, b) => b.readingDate.getTime() - a.readingDate.getTime()
    )

    if (!latestReading) {
      throw new Error(
        `WaterMeterLastReadingUpdater.No last reading provided for water meter ${waterMeter.id.toString()}`
      )
    }

    const waterPoint = await this.waterPointRepository.findById(waterMeter.waterPointId)
    if (!waterPoint) {
      throw new Error('Water point not found')
    }

    const communityZone = await this.communityZoneRepository.findById(waterPoint.communityZoneId)
    if (!communityZone) {
      throw new Error('Community zone not found')
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

    let dailyConsumption = 0
    if (!secondLatestReading) {
      const totalDays = 365
      dailyConsumption = latestReading.normalizedReading / totalDays
    } else {
      const daysSinceLastReading = differenceInDays(
        latestReading.readingDate,
        secondLatestReading.readingDate
      )
      if (daysSinceLastReading <= 0) {
        throw new Error('Days since last reading must be greater than 0')
      }
      dailyConsumption = latestReading.normalizedReading / daysSinceLastReading
    }

    const excessConsumption = dailyConsumption > waterLimitPerDay

    waterMeter.updateLastReading({
      normalizedReading: latestReading.normalizedReading,
      readingDate: latestReading.readingDate,
      excessConsumption
    })

    await this.waterMeterRepository.save(waterMeter)
    return waterMeter
  }
}
