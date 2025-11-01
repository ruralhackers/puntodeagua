import type { Id } from '@pda/common/domain'
import type { FileMetadata } from '@pda/storage'
import { WaterMeterNotFoundError } from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterImageRepository } from '../domain/repositories/water-meter-image.repository'
import type { FileDeleterService } from './file-deleter.service'
import type { FileUploaderService } from './file-uploader.service'

interface UpdateImageParams {
  waterMeterId: Id
  image?: {
    file: Buffer
    metadata: FileMetadata
  }
  deleteImage?: boolean
}

export class WaterMeterImageUpdaterService {
  constructor(
    private waterMeterRepo: WaterMeterRepository,
    private waterMeterImageRepo: WaterMeterImageRepository,
    private fileUploaderService: FileUploaderService,
    private fileDeleterService: FileDeleterService
  ) {}

  async run(params: UpdateImageParams) {
    const waterMeter = await this.waterMeterRepo.findById(params.waterMeterId)
    if (!waterMeter) {
      throw new WaterMeterNotFoundError()
    }

    const existingImage = await this.waterMeterImageRepo.findByWaterMeterId(params.waterMeterId)

    if (params.deleteImage && existingImage) {
      await this.fileDeleterService.deleteWaterMeterImage(params.waterMeterId)
      return { success: true, deleted: true }
    }

    if (params.image) {
      if (existingImage) {
        await this.fileDeleterService.deleteWaterMeterImage(params.waterMeterId)
      }

      await this.fileUploaderService.uploadWaterMeterImage({
        file: params.image.file,
        waterMeterId: params.waterMeterId,
        metadata: params.image.metadata
      })

      const newImage = await this.waterMeterImageRepo.findByWaterMeterId(params.waterMeterId)
      return { success: true, image: newImage?.toDto() }
    }

    return { success: true }
  }
}
