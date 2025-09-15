import { client as prisma } from '@pda/database'
import { CommunityPrismaRepository } from '../repositories/community.prisma-repository'

export class CommunityFactory {
  private static communityPrismaRepositoryInstance: CommunityPrismaRepository

  // REPOSITORIES
  static communityPrismaRepository() {
    if (!CommunityFactory.communityPrismaRepositoryInstance) {
      CommunityFactory.communityPrismaRepositoryInstance = new CommunityPrismaRepository(prisma)
    }
    return CommunityFactory.communityPrismaRepositoryInstance
  }
}
