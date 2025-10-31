import type { Id } from '@pda/common/domain'
import { WaterMeterNotFoundError } from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterLastReadingUpdater } from './water-meter-last-reading-updater.service'

export class WaterMeterExcessRecalculator {
  constructor(
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly waterMeterLastReadingUpdater: WaterMeterLastReadingUpdater
  ) {}

  async run(waterMeterId: Id): Promise<void> {
    // Get the water meter
    const waterMeter = await this.waterMeterRepository.findById(waterMeterId)
    if (!waterMeter) {
      throw new WaterMeterNotFoundError()
    }

    // Get the last 2 readings
    const lastReadings = await this.waterMeterReadingRepository.findLastReadingsForWaterMeter(
      waterMeterId,
      2
    )

    // If there are no readings, there's nothing to recalculate
    if (lastReadings.length === 0) {
      throw new Error('Cannot recalculate excess: water meter has no readings')
    }

    // Use the updater service to recalculate
    await this.waterMeterLastReadingUpdater.run(waterMeter, lastReadings)
  }
}
