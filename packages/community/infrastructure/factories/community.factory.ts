import { client as prisma } from '@pda/database'
import { CommunityPrismaRepository } from '../repositories/community.prisma-repository'
import { CommunityZonePrismaRepository } from '../repositories/community-zone.prisma-repository'
import { WaterDepositPrismaRepository } from '../repositories/water-deposit.prisma-repository'
import { WaterPointPrismaRepository } from '../repositories/water-point.prisma-repository'

export class CommunityFactory {
  private static communityPrismaRepositoryInstance: CommunityPrismaRepository
  private static waterPointPrismaRepositoryInstance: WaterPointPrismaRepository
  private static communityZonePrismaRepositoryInstance: CommunityZonePrismaRepository
  private static waterDepositPrismaRepositoryInstance: WaterDepositPrismaRepository

  // REPOSITORIES
  static communityPrismaRepository() {
    if (!CommunityFactory.communityPrismaRepositoryInstance) {
      CommunityFactory.communityPrismaRepositoryInstance = new CommunityPrismaRepository(prisma)
    }
    return CommunityFactory.communityPrismaRepositoryInstance
  }

  static waterPointPrismaRepository() {
    if (!CommunityFactory.waterPointPrismaRepositoryInstance) {
      CommunityFactory.waterPointPrismaRepositoryInstance = new WaterPointPrismaRepository(prisma)
    }
    return CommunityFactory.waterPointPrismaRepositoryInstance
  }

  static communityZonePrismaRepository() {
    if (!CommunityFactory.communityZonePrismaRepositoryInstance) {
      CommunityFactory.communityZonePrismaRepositoryInstance = new CommunityZonePrismaRepository(
        prisma
      )
    }
    return CommunityFactory.communityZonePrismaRepositoryInstance
  }

  static waterDepositPrismaRepository() {
    if (!CommunityFactory.waterDepositPrismaRepositoryInstance) {
      CommunityFactory.waterDepositPrismaRepositoryInstance = new WaterDepositPrismaRepository(
        prisma
      )
    }
    return CommunityFactory.waterDepositPrismaRepositoryInstance
  }
}
