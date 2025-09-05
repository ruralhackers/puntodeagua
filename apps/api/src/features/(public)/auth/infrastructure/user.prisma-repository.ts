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

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        communityId: true,
        emailVerified: true,
        image: true
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: Array.isArray(user.roles) ? (user.roles as string[]) : [],
      communityId: user.communityId,
      emailVerified: user.emailVerified,
      image: user.image
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        communityId: true,
        emailVerified: true,
        image: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: Array.isArray(user.roles) ? (user.roles as string[]) : [],
      communityId: user.communityId,
      emailVerified: user.emailVerified,
      image: user.image
    }))
  }

  async findByCommunity(communityId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        communityId: communityId
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        communityId: true,
        emailVerified: true,
        image: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: Array.isArray(user.roles) ? (user.roles as string[]) : [],
      communityId: user.communityId,
      emailVerified: user.emailVerified,
      image: user.image
    }))
  }

  async save(userData: {
    id?: string
    email: string
    name?: string | null
    password?: string | null
    roles: string[]
    communityId?: string | null
    emailVerified?: Date | null
    image?: string | null
  }) {
    const data = {
      email: userData.email,
      name: userData.name,
      password: userData.password,
      roles: userData.roles,
      communityId: userData.communityId,
      emailVerified: userData.emailVerified,
      image: userData.image
    }

    let user: any
    if (userData.id) {
      // Update existing user
      user = await this.prisma.user.update({
        where: { id: userData.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          communityId: true,
          emailVerified: true,
          image: true
        }
      })
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data,
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          communityId: true,
          emailVerified: true,
          image: true
        }
      })
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: Array.isArray(user.roles) ? (user.roles as string[]) : [],
      communityId: user.communityId,
      emailVerified: user.emailVerified,
      image: user.image
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    })
  }
}
