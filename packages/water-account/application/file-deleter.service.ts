import type { Id } from '@pda/common/domain'
import type { FileStorageRepository } from '@pda/storage'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'

export class FileDeleterService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly waterMeterReadingImageRepository: WaterMeterReadingImageRepository
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
}

