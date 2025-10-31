import { CommunityFactory } from '@pda/community'
import { client as prisma } from '@pda/database'
import { R2FileStorageRepository } from '@pda/storage'
import { FileDeleterService } from '../../application/file-deleter.service'
import { FileUploaderService } from '../../application/file-uploader.service'
import { WaterMeterExcessRecalculator } from '../../application/water-meter-excess-recalculator.service'
import { WaterMeterLastReadingUpdater } from '../../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingCreator } from '../../application/water-meter-reading-creator.service'
import { WaterMeterReadingUpdater } from '../../application/water-meter-reading-updater.service'
import { WaterMeterPrismaRepository } from '../repositories/water-meter.prisma-repository'
import { WaterMeterReadingPrismaRepository } from '../repositories/water-meter-reading.prisma-repository'
import { WaterMeterReadingImagePrismaRepository } from '../repositories/water-meter-reading-image.prisma-repository'

export class WaterAccountFactory {
  private static waterMeterPrismaRepositoryInstance: WaterMeterPrismaRepository
  private static waterMeterReadingPrismaRepositoryInstance: WaterMeterReadingPrismaRepository
  private static waterMeterReadingImagePrismaRepositoryInstance: WaterMeterReadingImagePrismaRepository
  private static r2FileStorageRepositoryInstance: R2FileStorageRepository

  // SERVICES
  static waterMeterReadingCreatorService() {
    return new WaterMeterReadingCreator(
      WaterAccountFactory.waterMeterLastReadingUpdaterService(),
      WaterAccountFactory.waterMeterReadingPrismaRepository(),
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.fileUploaderService()
    )
  }

  static waterMeterReadingUpdaterService() {
    return new WaterMeterReadingUpdater(
      WaterAccountFactory.waterMeterReadingPrismaRepository(),
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterMeterLastReadingUpdaterService(),
      WaterAccountFactory.waterMeterReadingImagePrismaRepository(),
      WaterAccountFactory.fileUploaderService(),
      WaterAccountFactory.fileDeleterService()
    )
  }

  static fileUploaderService() {
    return new FileUploaderService(
      WaterAccountFactory.r2FileStorageRepository(),
      WaterAccountFactory.waterMeterReadingImagePrismaRepository()
    )
  }

  static fileDeleterService() {
    return new FileDeleterService(
      WaterAccountFactory.r2FileStorageRepository(),
      WaterAccountFactory.waterMeterReadingImagePrismaRepository()
    )
  }

  static waterMeterExcessRecalculatorService() {
    return new WaterMeterExcessRecalculator(
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterMeterReadingPrismaRepository(),
      WaterAccountFactory.waterMeterLastReadingUpdaterService()
    )
  }

  static waterMeterLastReadingUpdaterService() {
    return new WaterMeterLastReadingUpdater(
      WaterAccountFactory.waterMeterPrismaRepository(),
      CommunityFactory.communityPrismaRepository(),
      CommunityFactory.communityZonePrismaRepository()
    )
  }

  // REPOSITORIES
  static waterMeterPrismaRepository() {
    if (!WaterAccountFactory.waterMeterPrismaRepositoryInstance) {
      WaterAccountFactory.waterMeterPrismaRepositoryInstance = new WaterMeterPrismaRepository(
        prisma
      )
    }
    return WaterAccountFactory.waterMeterPrismaRepositoryInstance
  }

  static waterMeterReadingPrismaRepository() {
    if (!WaterAccountFactory.waterMeterReadingPrismaRepositoryInstance) {
      WaterAccountFactory.waterMeterReadingPrismaRepositoryInstance =
        new WaterMeterReadingPrismaRepository(prisma)
    }
    return WaterAccountFactory.waterMeterReadingPrismaRepositoryInstance
  }

  static waterMeterReadingImagePrismaRepository() {
    if (!WaterAccountFactory.waterMeterReadingImagePrismaRepositoryInstance) {
      WaterAccountFactory.waterMeterReadingImagePrismaRepositoryInstance =
        new WaterMeterReadingImagePrismaRepository(prisma)
    }
    return WaterAccountFactory.waterMeterReadingImagePrismaRepositoryInstance
  }

  static r2FileStorageRepository() {
    if (!WaterAccountFactory.r2FileStorageRepositoryInstance) {
      WaterAccountFactory.r2FileStorageRepositoryInstance = new R2FileStorageRepository({
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || ''
      })
    }
    return WaterAccountFactory.r2FileStorageRepositoryInstance
  }
}
