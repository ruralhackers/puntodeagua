import { client as prisma } from '@pda/database'
import { UserUpdater } from '../controllers/user-updater.controller'
import { UserPrismaRepository } from '../repositories/user.prisma-repository'

export class UserFactory {
  private static userPrismaRepositoryInstance: UserPrismaRepository

  // CONTROLLERS
  static userUpdaterService() {
    return new UserUpdater(UserFactory.userPrismaRepository())
  }

  // REPOSITORIES
  static userPrismaRepository() {
    if (!UserFactory.userPrismaRepositoryInstance) {
      UserFactory.userPrismaRepositoryInstance = new UserPrismaRepository(prisma)
    }
    return UserFactory.userPrismaRepositoryInstance
  }
}
