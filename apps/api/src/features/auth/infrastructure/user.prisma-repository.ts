import type { Id, UserRoleType } from 'core'
import type { Prisma, PrismaClient } from 'database'
import { BasePrismaRepository, User, type UserDto, type UserRepository } from 'features'

export class UserPrismaRepository extends BasePrismaRepository implements UserRepository {
  protected readonly model = 'user'
  protected getModel(): PrismaClient['user'] {
    return this.db.user
  }

  async findByEmail(email: string) {
    const user = await this.getModel().findUnique({
      where: { email }
    })

    if (!user) {
      return undefined
    }

    return User.fromDto(this.fromPrismaPayload(user))
  }

  async findById(id: Id) {
    const user = await this.getModel().findUnique({
      where: { id: id.toString() }
    })

    if (!user) {
      return undefined
    }

    return User.fromDto(this.fromPrismaPayload(user))
  }

  async findAll() {
    const users = await this.getModel().findMany({})

    return users.map((user) => User.fromDto(this.fromPrismaPayload(user)))
  }

  async findByCommunity(id: Id) {
    const users = await this.getModel().findMany({
      where: {
        communityId: id.toString()
      },
      orderBy: {
        name: 'asc'
      }
    })

    return users.map((user) => User.fromDto(this.fromPrismaPayload(user)))
  }

  async save(user: User) {
    const update = {
      name: user.name,
      roles: user.roles.map((role) => role.toString()),
      emailVerified: user.emailVerified,
      image: user.image
    }

    await this.getModel().upsert({
      where: { id: user.id.toString() },
      create: {
        ...update,
        email: user.email,
        communityId: user.communityId ? user.communityId.toString() : null
      },
      update
    })
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(user: Prisma.UserGetPayload<null>): UserDto {
    return {
      id: user.id,
      email: user.email,
      password: user.password ?? '',
      name: user.name,
      roles: Array.isArray(user.roles) ? (user.roles as UserRoleType[]) : [],
      communityId: user.communityId,
      emailVerified: user.emailVerified,
      image: user.image
    }
  }
}
