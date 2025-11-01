import type { Id } from '@pda/common/domain'
import type { FileStorageRepository } from '@pda/storage'
import type { WaterMeterImageRepository } from '../domain/repositories/water-meter-image.repository'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'

export class FileDeleterService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly waterMeterReadingImageRepository: WaterMeterReadingImageRepository,
    private readonly waterMeterImageRepository: WaterMeterImageRepository
  ) {}

  async deleteWaterMeterReadingImage(imageId: Id): Promise<void> {
    // Get the image from database
    const image = await this.waterMeterReadingImageRepository.findById(imageId)
    if (!image) {
      return // Image not found, nothing to delete
    }

    // Delete from storage
    await this.fileStorageRepository.delete(image.externalKey)

    // Delete from database
    await this.waterMeterReadingImageRepository.delete(imageId)
  }

  async deleteWaterMeterImage(waterMeterId: Id): Promise<void> {
    // Get the image from database
    const image = await this.waterMeterImageRepository.findByWaterMeterId(waterMeterId)
    if (!image) {
      return // Image not found, nothing to delete
    }

    // Delete from storage
    await this.fileStorageRepository.delete(image.externalKey)

    // Delete from database
    await this.waterMeterImageRepository.delete(image.id)
  }
}
