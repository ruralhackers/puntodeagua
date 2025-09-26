import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { WaterDeposit } from '../../domain/entities/water-deposit'
import type { WaterDepositRepository } from '../../domain/repositories/water-deposit.repository'
import { waterDepositTableConfig } from './water-deposit-table-config'

export class WaterDepositPrismaRepository
  extends BasePrismaRepository
  implements WaterDepositRepository
{
  protected readonly model = 'waterDeposit'
  private readonly tableBuilder: PrismaTableQueryBuilder<WaterDeposit, WaterDeposit>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...waterDepositTableConfig,
      entityFromDto: (dto: Prisma.WaterDepositGetPayload<null>) =>
        WaterDeposit.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<WaterDeposit>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<WaterDeposit[]> {
    const waterDeposits = await this.getModel().findMany()
    return waterDeposits.map((waterDeposit) =>
      WaterDeposit.fromDto(this.fromPrismaPayload(waterDeposit))
    )
  }

  async findById(id: Id) {
    const waterDeposit = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return waterDeposit ? WaterDeposit.fromDto(this.fromPrismaPayload(waterDeposit)) : undefined
  }

  async save(waterDeposit: WaterDeposit) {
    const update = {
      name: waterDeposit.name,
      location: waterDeposit.location,
      notes: waterDeposit.notes
    }

    await this.getModel().upsert({
      where: {
        id: waterDeposit.id.toString()
      },
      create: {
        ...update,
        id: waterDeposit.id.toString(),
        communityId: waterDeposit.communityId.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.WaterDepositGetPayload<null>) {
    return {
      ...payload
    }
  }
}
