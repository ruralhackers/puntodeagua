import { client as prisma } from '@ph/database'
import { UserPrismaRepository } from '../repositories/user-prisma.repository'

export class UserFactory {
  private static userPrismaRepositoryInstance: UserPrismaRepository

  // REPOSITORIES
  static userPrismaRepository() {
    if (!UserFactory.userPrismaRepositoryInstance) {
      UserFactory.userPrismaRepositoryInstance = new UserPrismaRepository(prisma)
    }
    return UserFactory.userPrismaRepositoryInstance
  }
}
