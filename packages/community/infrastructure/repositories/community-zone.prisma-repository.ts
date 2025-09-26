import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { CommunityZone } from '../../domain/entities/community-zone'
import type { CommunityZoneRepository } from '../../domain/repositories/community-zone.repository'
import { communityTableConfig } from './community-table-config'

export class CommunityZonePrismaRepository
  extends BasePrismaRepository
  implements CommunityZoneRepository
{
  protected readonly model = 'communityZone'
  private readonly tableBuilder: PrismaTableQueryBuilder<CommunityZone, CommunityZone>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...communityTableConfig,
      entityFromDto: (dto: Prisma.CommunityZoneGetPayload<null>) => CommunityZone.fromDto(dto)
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<CommunityZone>> {
    return this.tableBuilder.findForTable(params)
  }

  async findByCommunityId(id: Id) {
    const zones = await this.getModel().findMany({
      where: { communityId: id.toString() }
    })
    return zones.map((zone) => CommunityZone.fromDto(zone))
  }

  async save(zone: CommunityZone) {
    const update = {
      name: zone.name,
      communityId: zone.communityId.toString(),
      notes: zone.notes
    }

    await this.getModel().upsert({
      where: {
        id: zone.id.toString()
      },
      create: {
        ...update,
        id: zone.id.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }
}
