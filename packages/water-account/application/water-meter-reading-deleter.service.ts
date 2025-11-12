import { Id } from '@pda/common/domain'
import { ImageEntityType } from '@pda/storage'
import type { FileDeleterService } from './file-deleter.service'
import type { WaterMeterLastReadingUpdater } from './water-meter-last-reading-updater.service'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'

export class WaterMeterReadingDeleter {
  constructor(
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly waterMeterLastReadingUpdater: WaterMeterLastReadingUpdater,
    private readonly waterMeterReadingImageRepository?: WaterMeterReadingImageRepository,
    private readonly fileDeleterService?: FileDeleterService
  ) {}

  async run(readingId: Id): Promise<void> {
    // Find the reading to delete
    const reading = await this.waterMeterReadingRepository.findById(readingId)
    if (!reading) {
      throw new Error('Water meter reading not found')
    }

    // Find the water meter
    const waterMeter = await this.waterMeterRepository.findById(reading.waterMeterId)
    if (!waterMeter) {
      throw new Error('Water meter not found')
    }

    // Verify this is the last reading (safety check)
    const lastReading = await this.waterMeterReadingRepository.findLastReading(
      reading.waterMeterId
    )
    if (!lastReading || !lastReading.id.equals(readingId)) {
      throw new Error('Can only delete the most recent reading')
    }

    // Delete associated image if it exists
    if (this.waterMeterReadingImageRepository && this.fileDeleterService) {
      try {
        const image = await this.waterMeterReadingImageRepository.findByWaterMeterReadingId(
          readingId
        )
        if (image) {
          await this.fileDeleterService.run({
            entityId: image.id,
            entityType: ImageEntityType.WATER_METER_READING
          })
        }
      } catch (error) {
        // Log error but continue with reading deletion
        console.error('Failed to delete image for water meter reading:', error)
      }
    }

    // Delete the reading
    await this.waterMeterReadingRepository.delete(readingId)

    // Update water meter with new last reading or null values
    const remainingReadings = await this.waterMeterReadingRepository.findLastReadingsForWaterMeter(
      reading.waterMeterId,
      2
    )

    if (remainingReadings.length > 0) {
      // Update with the remaining readings
      await this.waterMeterLastReadingUpdater.run(waterMeter, remainingReadings)
    } else {
      // No more readings, set water meter values to null
      waterMeter.updateLastReading({
        normalizedReading: null,
        readingDate: null,
        excessConsumption: null
      })
      await this.waterMeterRepository.save(waterMeter)
    }
  }
}

