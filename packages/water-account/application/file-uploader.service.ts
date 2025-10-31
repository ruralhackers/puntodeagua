import type { Id } from '@pda/common/domain'
import {
  type FileMetadata,
  FileSizeExceededError,
  type FileStorageRepository,
  InvalidFileTypeError,
  MAX_FILE_SIZE,
  VALID_IMAGE_TYPES
} from '@pda/storage'
import { WaterMeterReadingImage } from '../domain/entities/water-meter-reading-image'
import type { WaterMeterReadingImageRepository } from '../domain/repositories/water-meter-reading-image.repository'

export class FileUploaderService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly waterMeterReadingImageRepository: WaterMeterReadingImageRepository
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
