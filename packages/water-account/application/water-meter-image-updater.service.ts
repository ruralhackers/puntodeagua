import type { Id } from '@pda/common/domain'
import { type FileMetadata, ImageEntityType } from '@pda/storage'
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
      await this.fileDeleterService.run({
        entityId: params.waterMeterId,
        entityType: ImageEntityType.WATER_METER
      })
      return { success: true, deleted: true }
    }

    if (params.image) {
      if (existingImage) {
        await this.fileDeleterService.run({
          entityId: params.waterMeterId,
          entityType: ImageEntityType.WATER_METER
        })
      }

      await this.fileUploaderService.run({
        file: params.image.file,
        entityId: params.waterMeterId,
        entityType: ImageEntityType.WATER_METER,
        metadata: params.image.metadata
      })

      const newImage = await this.waterMeterImageRepo.findByWaterMeterId(params.waterMeterId)
      return { success: true, image: newImage?.toDto() }
    }

    return { success: true }
  }
}
