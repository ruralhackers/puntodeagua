import { Decimal, type Id } from '@pda/common/domain'
import { WaterMeterReading } from '../domain/entities/water-meter-reading'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterLastReadingUpdater } from './water-meter-last-reading-updater.service'

export class WaterMeterReadingCreator {
  constructor(
    private readonly waterMeterLastReadingUpdater: WaterMeterLastReadingUpdater,
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly waterMeterRepository: WaterMeterRepository
  ) {}

  async run(params: { waterMeterId: Id; reading: string; date?: Date; notes?: string }) {
    const { waterMeterId, reading, date, notes } = params
    const waterMeter = await this.waterMeterRepository.findById(waterMeterId)
    if (!waterMeter) {
      throw new Error('Water meter not found')
    }

    if (date && date > new Date()) {
      throw new Error('Reading date cannot be in the future')
    }

    const lastReadings = []

    const newWaterReading = WaterMeterReading.create({
      waterMeterId: waterMeter.id.toString(),
      reading,
      normalizedReading: waterMeter.measurementUnit.normalize(Decimal.fromString(reading)),
      readingDate: date ? new Date(date) : new Date(),
      notes
    })

    const lastReading = await this.waterMeterReadingRepository.findLastReading(waterMeter.id)
    if (lastReading) {
      lastReadings.push(lastReading)
      if (newWaterReading.readingDate <= lastReading.readingDate) {
        throw new Error('New reading date must be after the last reading date')
      }
      if (newWaterReading.normalizedReading < lastReading.normalizedReading) {
        throw new Error('New reading is lower than last reading')
      }
    }

    await this.waterMeterReadingRepository.save(newWaterReading)
    lastReadings.push(newWaterReading)

    // Update last reading in water meter. If we would have events we would launch an event instead
    await this.waterMeterLastReadingUpdater.run(waterMeter, lastReadings)

    return newWaterReading
  }
}
