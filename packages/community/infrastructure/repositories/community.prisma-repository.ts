import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { Community } from '../../domain/entities/community'
import type { CommunityRepository } from '../../domain/repositories/community.repository'
import { communityTableConfig } from './community-table-config'

export class CommunityPrismaRepository extends BasePrismaRepository implements CommunityRepository {
  protected readonly model = 'community'
  private readonly tableBuilder: PrismaTableQueryBuilder<Community, Community>

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...communityTableConfig,
      entityFromDto: (dto: Prisma.CommunityGetPayload<null>) => Community.fromDto(dto)
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<Community>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<Community[]> {
    const communities = await this.getModel().findMany()
    return communities.map((community) => Community.fromDto(community))
  }

  async findById(id: Id) {
    const community = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return community ? Community.fromDto(community) : undefined
  }

  async save(community: Community) {
    const update = {
      name: community.name,
      waterLimitRule: community.waterLimitRule.toDto()
    }

    await this.getModel().upsert({
      where: {
        id: community.id.toString()
      },
      create: {
        ...update,
        id: community.id.toString(),
        planId: community.planId.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  protected getModel() {
    return this.db[this.model]
  }
}
