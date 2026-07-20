import { client as prisma } from '@pda/database'
import { CommunityFactory } from '@pda/community'
import { FeeConfigFinder } from '../../application/fee-config-finder.service'
import { FeeConfigUpserter } from '../../application/fee-config-upserter.service'
import { FeePaymentCreator } from '../../application/fee-payment-creator.service'
import { FeePaymentDeleter } from '../../application/fee-payment-deleter.service'
import { FeePaymentFinder } from '../../application/fee-payment-finder.service'
import { FeePaymentUpdater } from '../../application/fee-payment-updater.service'
import { FeeConfigPrismaRepository } from '../repositories/fee-config.prisma-repository'
import { FeePaymentPrismaRepository } from '../repositories/fee-payment.prisma-repository'

export class FeesFactory {
  private static feeConfigPrismaRepositoryInstance: FeeConfigPrismaRepository
  private static feePaymentPrismaRepositoryInstance: FeePaymentPrismaRepository

  static feeConfigPrismaRepository() {
    if (!FeesFactory.feeConfigPrismaRepositoryInstance) {
      FeesFactory.feeConfigPrismaRepositoryInstance = new FeeConfigPrismaRepository(prisma)
    }
    return FeesFactory.feeConfigPrismaRepositoryInstance
  }

  static feePaymentPrismaRepository() {
    if (!FeesFactory.feePaymentPrismaRepositoryInstance) {
      FeesFactory.feePaymentPrismaRepositoryInstance = new FeePaymentPrismaRepository(prisma)
    }
    return FeesFactory.feePaymentPrismaRepositoryInstance
  }

  static feeConfigFinderService() {
    return new FeeConfigFinder(FeesFactory.feeConfigPrismaRepository())
  }

  static feeConfigUpserterService() {
    return new FeeConfigUpserter(FeesFactory.feeConfigPrismaRepository())
  }

  static feePaymentFinderService() {
    return new FeePaymentFinder(FeesFactory.feePaymentPrismaRepository())
  }

  static feePaymentCreatorService() {
    return new FeePaymentCreator(
      FeesFactory.feePaymentPrismaRepository(),
      CommunityFactory.waterPointPrismaRepository()
    )
  }

  static feePaymentUpdaterService() {
    return new FeePaymentUpdater(
      FeesFactory.feePaymentPrismaRepository(),
      CommunityFactory.waterPointPrismaRepository()
    )
  }

  static feePaymentDeleterService() {
    return new FeePaymentDeleter(FeesFactory.feePaymentPrismaRepository())
  }
}
