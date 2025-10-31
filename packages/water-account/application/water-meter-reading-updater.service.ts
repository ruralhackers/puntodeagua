import { Decimal, type Id } from '@pda/common/domain'
import type { WaterMeterReading } from '../domain/entities/water-meter-reading'
import type { WaterMeterReadingUpdateDto } from '../domain/entities/water-meter-reading.dto'
import {
  WaterMeterNotFoundError,
  WaterMeterReadingNotAllowedError,
  WaterMeterReadingNotLastError
} from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterLastReadingUpdater } from './water-meter-last-reading-updater.service'

export class WaterMeterReadingUpdater {
  constructor(
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly waterMeterLastReadingUpdater: WaterMeterLastReadingUpdater
  ) {}

  async run(params: {
    id: Id
    updatedData: WaterMeterReadingUpdateDto
  }): Promise<WaterMeterReading> {
    const { id, updatedData } = params

    // Find the reading to update
    const existingReading = await this.waterMeterReadingRepository.findById(id)
    if (!existingReading) {
      throw new Error('Water meter reading not found')
    }

    // Get the water meter to access measurementUnit
    const waterMeter = await this.waterMeterRepository.findById(existingReading.waterMeterId)
    if (!waterMeter) {
      throw new WaterMeterNotFoundError()
    }

    // Validate it's the last reading by date
    const lastReading = await this.waterMeterReadingRepository.findLastReading(waterMeter.id)
    if (!lastReading || lastReading.id.toString() !== id.toString()) {
      throw new WaterMeterReadingNotLastError()
    }

    // If reading value is being updated, validate it's not lower than the previous reading
    if (updatedData.reading !== undefined) {
      // Get the last readings to compare with the previous one
      const lastReadings = await this.waterMeterReadingRepository.findLastReadingsForWaterMeter(
        waterMeter.id,
        2
      )

      if (lastReadings.length > 1) {
        const previousReading = lastReadings[1] // Second most recent reading
        const newNormalizedReading = waterMeter.measurementUnit.normalize(
          Decimal.fromString(updatedData.reading)
        )

        if (previousReading && newNormalizedReading < previousReading.normalizedReading) {
          throw new WaterMeterReadingNotAllowedError()
        }
      }
    }

    // Update the reading entity
    const updatedReading = existingReading.update(updatedData, waterMeter.measurementUnit)

    // Save the updated reading
    await this.waterMeterReadingRepository.save(updatedReading)

    // Get the last readings AFTER saving to ensure we have the updated reading
    // This includes the updated reading and the previous one (if exists)
    const lastReadings = await this.waterMeterReadingRepository.findLastReadingsForWaterMeter(
      waterMeter.id,
      2
    )

    // Always trigger lastReadingUpdater to recalculate water meter data
    // This ensures lastReadingNormalizedValue, lastReadingExcessConsumption, etc. are correct
    await this.waterMeterLastReadingUpdater.run(waterMeter, lastReadings)

    return updatedReading
  }
}
