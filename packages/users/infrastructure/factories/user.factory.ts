import { client as prisma } from '@ph/database'
import { UserUpdaterController } from '../controllers/user-updater.controller'
import { UserPrismaRepository } from '../repositories/user-prisma.repository'

export class UserFactory {
  private static userPrismaRepositoryInstance: UserPrismaRepository

  // CONTROLLERS
  static userUpdaterController() {
    return new UserUpdaterController(UserFactory.userPrismaRepository())
  }

  // REPOSITORIES
  static userPrismaRepository() {
    if (!UserFactory.userPrismaRepositoryInstance) {
      UserFactory.userPrismaRepositoryInstance = new UserPrismaRepository(prisma)
    }
    return UserFactory.userPrismaRepositoryInstance
  }
}
