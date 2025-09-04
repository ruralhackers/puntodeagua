import type { PrismaClient } from 'database'
import type { UserRepository } from 'features'

export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roles: true,
        communityId: true
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      roles: Array.isArray(user.roles) ? (user.roles as string[]) : [],
      communityId: user.communityId
    }
  }
}
