import { CommunityFactory } from '@pda/community'
import { client as prisma } from '@pda/database'
import { WaterMeterExcessRecalculator } from '../../application/water-meter-excess-recalculator.service'
import { WaterMeterLastReadingUpdater } from '../../application/water-meter-last-reading-updater.service'
import { WaterMeterReadingCreator } from '../../application/water-meter-reading-creator.service'
import { WaterMeterReadingUpdater } from '../../application/water-meter-reading-updater.service'
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

  static waterMeterReadingUpdaterService() {
    return new WaterMeterReadingUpdater(
      WaterAccountFactory.waterMeterReadingPrismaRepository(),
      WaterAccountFactory.waterMeterPrismaRepository(),
      WaterAccountFactory.waterMeterLastReadingUpdaterService()
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
}
