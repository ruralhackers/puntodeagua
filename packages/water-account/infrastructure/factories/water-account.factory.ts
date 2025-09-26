import { CommunityFactory } from '@pda/community'
import { client as prisma } from '@pda/database'
import { WaterMeterLastReadingUpdater } from '../../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingCreator } from '../../application/water-meter-reading-creator.service'
import { WaterMeterPrismaRepository } from '../repositories/water-meter.prisma-repository'
import { WaterMeterReadingPrismaRepository } from '../repositories/water-meter-reading.prisma-repository'

export class WaterAccountFactory {
  private static waterMeterPrismaRepositoryInstance: WaterMeterPrismaRepository
  private static waterMeterReadingPrismaRepositoryInstance: WaterMeterReadingPrismaRepository

  // SERVICES
  static waterMeterReadingCreatorService() {
    return new WaterMeterReadingCreator(
      WaterAccountFactory.waterMeterLastReadingUpdaterService(),
      WaterAccountFactory.waterMeterReadingPrismaRepository(),
      WaterAccountFactory.waterMeterPrismaRepository()
    )
  }

  private static waterMeterLastReadingUpdaterService() {
    return new WaterMeterLastReadingUpdater(
      WaterAccountFactory.waterMeterPrismaRepository(),
      CommunityFactory.communityPrismaRepository(),
      CommunityFactory.communityZonePrismaRepository(),
      CommunityFactory.waterPointPrismaRepository()
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
}
