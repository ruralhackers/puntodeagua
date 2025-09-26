import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { WaterMeter } from '../../domain/entities/water-meter'
import type { WaterMeterRepository } from '../../domain/repositories/water-meter.repository'
import { waterMeterTableConfig } from './water-meter-table-config'

export class WaterMeterPrismaRepository
  extends BasePrismaRepository
  implements WaterMeterRepository
{
  protected readonly model = 'waterMeter'
  private readonly tableBuilder: PrismaTableQueryBuilder<WaterMeter, WaterMeter>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...waterMeterTableConfig,
      entityFromDto: (dto: Prisma.WaterMeterGetPayload<null>) => WaterMeter.fromDto(dto)
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<WaterMeter>> {
    return this.tableBuilder.findForTable(params)
  }

  async findById(id: Id) {
    const dto = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    if (!dto) return undefined
    return WaterMeter.fromDto(dto)
  }

  async findByWaterPointId(id: Id) {
    const meters = await this.getModel().findMany({
      where: { waterPointId: id.toString() }
    })
    return meters.map((m) => WaterMeter.fromDto(m))
  }

  async save(zone: WaterMeter) {
    const update = {
      name: zone.name,
      measurementUnit: zone.measurementUnit.toString(),
      lastReadingNormalizedValue: zone.lastReadingNormalizedValue ?? null,
      lastReadingDate: zone.lastReadingDate ?? null,
      lastReadingExcessConsumption: zone.lastReadingExcessConsumption ?? null,
      waterAccountId: zone.waterAccountId.toString(),
      waterPointId: zone.waterPointId.toString()
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
