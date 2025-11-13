import { CommunityFactory } from '@pda/community'
import { client as prisma } from '@pda/database'
import {
  FileDeleterService,
  FileEntityType,
  FileUploaderService,
  R2FileStorageRepository
} from '@pda/storage'
import { WaterMeterExcessRecalculator } from '../../application/water-meter-excess-recalculator.service'
import { WaterMeterImageUpdaterService } from '../../application/water-meter-image-updater.service'
import { WaterMeterLastReadingUpdater } from '../../application/water-meter-last-reading-updater.service'
import { WaterMeterOwnerChanger } from '../../application/water-meter-owner-changer.service'
import { WaterMeterReadingCreator } from '../../application/water-meter-reading-creator.service'
import { WaterMeterReadingDeleter } from '../../application/water-meter-reading-deleter.service'
import { WaterMeterReadingUpdater } from '../../application/water-meter-reading-updater.service'
import { WaterMeterReplacer } from '../../application/water-meter-replacer.service'
import { WaterAccountPrismaRepository } from '../repositories/water-account.prisma-repository'
import { WaterMeterPrismaRepository } from '../repositories/water-meter.prisma-repository'
import { WaterMeterImagePrismaRepository } from '../repositories/water-meter-image.prisma-repository'
import { WaterMeterReadingPrismaRepository } from '../repositories/water-meter-reading.prisma-repository'
import { WaterMeterReadingImagePrismaRepository } from '../repositories/water-meter-reading-image.prisma-repository'

export class WaterAccountFactory {
  private static waterMeterPrismaRepositoryInstance: WaterMeterPrismaRepository
  private static waterMeterReadingPrismaRepositoryInstance: WaterMeterReadingPrismaRepository
  private static waterMeterReadingImagePrismaRepositoryInstance: WaterMeterReadingImagePrismaRepository
  private static waterMeterImagePrismaRepositoryInstance: WaterMeterImagePrismaRepository
  private static waterAccountPrismaRepositoryInstance: WaterAccountPrismaRepository
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

  static waterMeterReadingDeleterService() {
    return new WaterMeterReadingDeleter(
      WaterAccountFactory.waterMeterReadingPrismaRepository(),
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterMeterLastReadingUpdaterService(),
      WaterAccountFactory.waterMeterReadingImagePrismaRepository(),
      WaterAccountFactory.fileDeleterService()
    )
  }

  static fileUploaderService() {
    const repositoryMap = new Map()
    repositoryMap.set(
      FileEntityType.WATER_METER,
      WaterAccountFactory.waterMeterImagePrismaRepository()
    )
    repositoryMap.set(
      FileEntityType.WATER_METER_READING,
      WaterAccountFactory.waterMeterReadingImagePrismaRepository()
    )

    return new FileUploaderService(WaterAccountFactory.r2FileStorageRepository(), repositoryMap)
  }

  static fileDeleterService() {
    const repositoryMap = new Map()
    repositoryMap.set(
      FileEntityType.WATER_METER,
      WaterAccountFactory.waterMeterImagePrismaRepository()
    )
    repositoryMap.set(
      FileEntityType.WATER_METER_READING,
      WaterAccountFactory.waterMeterReadingImagePrismaRepository()
    )

    return new FileDeleterService(WaterAccountFactory.r2FileStorageRepository(), repositoryMap)
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

  static waterMeterReplacerService() {
    return new WaterMeterReplacer(
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterMeterReadingCreatorService(),
      WaterAccountFactory.fileUploaderService()
    )
  }

  static waterMeterOwnerChangerService() {
    return new WaterMeterOwnerChanger(
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterAccountPrismaRepository()
    )
  }

  static waterMeterImageUpdaterService() {
    return new WaterMeterImageUpdaterService(
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterMeterImagePrismaRepository(),
      WaterAccountFactory.fileUploaderService(),
      WaterAccountFactory.fileDeleterService()
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

  static waterAccountPrismaRepository() {
    if (!WaterAccountFactory.waterAccountPrismaRepositoryInstance) {
      WaterAccountFactory.waterAccountPrismaRepositoryInstance = new WaterAccountPrismaRepository(
        prisma
      )
    }
    return WaterAccountFactory.waterAccountPrismaRepositoryInstance
  }

  static waterMeterImagePrismaRepository() {
    if (!WaterAccountFactory.waterMeterImagePrismaRepositoryInstance) {
      WaterAccountFactory.waterMeterImagePrismaRepositoryInstance =
        new WaterMeterImagePrismaRepository(prisma)
    }
    return WaterAccountFactory.waterMeterImagePrismaRepositoryInstance
  }
}
