import type { Id } from 'core'
import type { PrismaClient } from 'database'
import { BasePrismaRepository, Community, type CommunityRepository } from 'features'

export class CommunityPrismaRepository extends BasePrismaRepository implements CommunityRepository {
  protected readonly model = 'community'
  protected getModel(): PrismaClient['community'] {
    return this.db.community
  }

  async save(input: Community): Promise<void> {
    const communityData = {
      id: input.id.toString(),
      name: input.name,
      planId: input.planId.toString()
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create: {
        ...communityData
      },
      update: {
        ...communityData
      }
    })
  }

  async findById(id: Id): Promise<Community | undefined> {
    const community = await this.getModel().findUnique({ where: { id: id.toString() } })
    return community ? Community.create(community) : undefined
  }

  async findAll(): Promise<Community[]> {
    const communities = await this.getModel().findMany()
    return communities.map((c) => Community.create(c))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}
