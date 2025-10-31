import { Decimal, type Id } from '@pda/common/domain'
import type { FileMetadata } from '@pda/storage'
import type { WaterMeterReading } from '../domain/entities/water-meter-reading'
import type { WaterMeterReadingUpdateDto } from '../domain/entities/water-meter-reading.dto'
import {
  WaterMeterNotFoundError,
  WaterMeterReadingNotAllowedError,
  WaterMeterReadingNotLastError
} from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../domain/repositories/water-meter-reading.repository'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'
import type { FileDeleterService } from './file-deleter.service'
import type { FileUploaderService } from './file-uploader.service'
import type { WaterMeterLastReadingUpdater } from './water-meter-last-reading-updater.service'

export class WaterMeterReadingUpdater {
  constructor(
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly waterMeterLastReadingUpdater: WaterMeterLastReadingUpdater,
    private readonly waterMeterReadingImageRepository?: WaterMeterReadingImageRepository,
    private readonly fileUploaderService?: FileUploaderService,
    private readonly fileDeleterService?: FileDeleterService
  ) {}

  async run(params: {
    id: Id
    updatedData: WaterMeterReadingUpdateDto
    image?: { file: Buffer; metadata: FileMetadata }
    deleteImage?: boolean
  }): Promise<WaterMeterReading> {
    const { id, updatedData, image, deleteImage } = params

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

    // Validate it's one of the last two readings
    const lastReadings = await this.waterMeterReadingRepository.findLastReadingsForWaterMeter(
      waterMeter.id,
      2
    )

    const isLastReading = lastReadings[0]?.id.toString() === id.toString()
    const isPreviousReading = lastReadings[1]?.id.toString() === id.toString()

    if (!isLastReading && !isPreviousReading) {
      throw new WaterMeterReadingNotLastError()
    }

    // If reading value is being updated, validate according to which reading is being edited
    if (updatedData.reading !== undefined) {
      const newNormalizedReading = waterMeter.measurementUnit.normalize(
        Decimal.fromString(updatedData.reading)
      )

      if (isLastReading && lastReadings.length > 1) {
        // Editing the last reading: must be >= previous reading
        const previousReading = lastReadings[1]
        if (previousReading && newNormalizedReading < previousReading.normalizedReading) {
          throw new WaterMeterReadingNotAllowedError()
        }
      } else if (isPreviousReading) {
        // Editing the previous reading: must be <= last reading
        const lastReading = lastReadings[0]
        if (lastReading && newNormalizedReading > lastReading.normalizedReading) {
          throw new WaterMeterReadingNotAllowedError()
        }
      }
    }

    // Update the reading entity
    const updatedReading = existingReading.update(updatedData, waterMeter.measurementUnit)

    // Save the updated reading
    await this.waterMeterReadingRepository.save(updatedReading)

    // Handle image operations
    if (this.waterMeterReadingImageRepository && this.fileDeleterService && this.fileUploaderService) {
      const existingImage = await this.waterMeterReadingImageRepository.findByWaterMeterReadingId(id)

      // Delete existing image if requested or if replacing with new image
      if (existingImage && (deleteImage || image)) {
        await this.fileDeleterService.deleteWaterMeterReadingImage(existingImage.id)
      }

      // Upload new image if provided
      if (image) {
        await this.fileUploaderService.uploadWaterMeterReadingImage({
          file: image.file,
          waterMeterReadingId: id,
          metadata: image.metadata
        })
      }
    }

    // Get the last readings AFTER saving to ensure we have the updated reading
    // This includes the updated reading and the previous one (if exists)
    const updatedLastReadings =
      await this.waterMeterReadingRepository.findLastReadingsForWaterMeter(waterMeter.id, 2)

    // Always trigger lastReadingUpdater to recalculate water meter data
    // This ensures lastReadingNormalizedValue, lastReadingExcessConsumption, etc. are correct
    await this.waterMeterLastReadingUpdater.run(waterMeter, updatedLastReadings)

    return updatedReading
  }
}
