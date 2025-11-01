import type { Id } from '@pda/common/domain'
import {
  type FileMetadata,
  FileSizeExceededError,
  type FileStorageRepository,
  InvalidFileTypeError,
  MAX_FILE_SIZE,
  VALID_IMAGE_TYPES
} from '@pda/storage'
import { WaterMeterImage } from '../domain/entities/water-meter-image'
import { WaterMeterReadingImage } from '../domain/entities/water-meter-reading-image'
import type { WaterMeterImageRepository } from '../domain/repositories/water-meter-image.repository'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'

export class FileUploaderService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly waterMeterReadingImageRepository: WaterMeterReadingImageRepository,
    private readonly waterMeterImageRepository: WaterMeterImageRepository
  ) {}

  async uploadWaterMeterReadingImage(params: {
    file: Buffer
    waterMeterReadingId: Id
    metadata: FileMetadata
  }): Promise<string> {
    const { file, waterMeterReadingId, metadata } = params

    // Validate file
    this.validateFile(metadata)

    // Upload to storage
    const uploadResult = await this.fileStorageRepository.upload(
      file,
      metadata,
      waterMeterReadingId.toString(),
      'water-meter-readings'
    )

    // Create WaterMeterReadingImage entity
    const image = WaterMeterReadingImage.create({
      waterMeterReadingId: waterMeterReadingId.toString(),
      url: uploadResult.url,
      fileName: uploadResult.metadata.fileName,
      fileSize: uploadResult.metadata.fileSize,
      mimeType: uploadResult.metadata.mimeType,
      uploadedAt: new Date(),
      externalKey: uploadResult.externalKey
    })

    // Save to database
    await this.waterMeterReadingImageRepository.save(image)

    return uploadResult.url
  }

  async uploadWaterMeterImage(params: {
    file: Buffer
    waterMeterId: Id
    metadata: FileMetadata
  }): Promise<string> {
    const { file, waterMeterId, metadata } = params

    // Validate file
    this.validateFile(metadata)

    // Upload to storage
    const uploadResult = await this.fileStorageRepository.upload(
      file,
      metadata,
      waterMeterId.toString(),
      'water-meters'
    )

    // Create WaterMeterImage entity
    const image = WaterMeterImage.create({
      waterMeterId: waterMeterId.toString(),
      url: uploadResult.url,
      fileName: uploadResult.metadata.fileName,
      fileSize: uploadResult.metadata.fileSize,
      mimeType: uploadResult.metadata.mimeType,
      externalKey: uploadResult.externalKey
    })

    // Save to database
    await this.waterMeterImageRepository.save(image)

    return uploadResult.url
  }

  private validateFile(metadata: FileMetadata): void {
    // Validate file type
    if (!VALID_IMAGE_TYPES.includes(metadata.mimeType as any)) {
      throw new InvalidFileTypeError(metadata.mimeType)
    }

    // Validate file size
    if (metadata.fileSize > MAX_FILE_SIZE) {
      throw new FileSizeExceededError(metadata.fileSize, MAX_FILE_SIZE)
    }
  }
}
