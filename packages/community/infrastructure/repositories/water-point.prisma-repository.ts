import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { WaterPoint } from '../../domain/entities/water-point'
import type { WaterPointRepository } from '../../domain/repositories/water-point.repository'
import { waterPointTableConfig } from './water-point-table-config'

export class WaterPointPrismaRepository
  extends BasePrismaRepository
  implements WaterPointRepository
{
  protected readonly model = 'waterPoint'
  private readonly tableBuilder: PrismaTableQueryBuilder<WaterPoint, WaterPoint>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...waterPointTableConfig,
      entityFromDto: (dto: Prisma.WaterPointGetPayload<null>) =>
        WaterPoint.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<WaterPoint>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<WaterPoint[]> {
    const waterPoints = await this.getModel().findMany()
    return waterPoints.map((waterPoint) => WaterPoint.fromDto(this.fromPrismaPayload(waterPoint)))
  }

  async findById(id: Id) {
    const waterPoint = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return waterPoint ? WaterPoint.fromDto(this.fromPrismaPayload(waterPoint)) : undefined
  }

  async save(waterPoint: WaterPoint) {
    const update = {
      name: waterPoint.name,
      location: waterPoint.location,
      notes: waterPoint.notes,
      fixedPopulation: waterPoint.fixedPopulation,
      floatingPopulation: waterPoint.floatingPopulation,
      cadastralReference: waterPoint.cadastralReference
    }

    await this.getModel().upsert({
      where: {
        id: waterPoint.id.toString()
      },
      create: {
        ...update,
        id: waterPoint.id.toString(),
        communityZoneId: waterPoint.communityZoneId.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.WaterPointGetPayload<null>) {
    return {
      ...payload
    }
  }
}
