import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import { Prisma, type client as prisma } from '@pda/database'
import type { WaterMeterReadingDto } from '../../domain'
import { WaterMeterReading } from '../../domain/entities/water-meter-reading'
import type { WaterMeterReadingRepository } from '../../domain/repositories/water-meter-reading.repository'
import { waterMeterReadingTableConfig } from './water-meter-reading-table-config'

export class WaterMeterReadingPrismaRepository
  extends BasePrismaRepository
  implements WaterMeterReadingRepository
{
  protected readonly model = 'waterMeterReading'
  private readonly tableBuilder: PrismaTableQueryBuilder<WaterMeterReading, WaterMeterReading>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...waterMeterReadingTableConfig,
      entityFromDto: (dto: Prisma.WaterMeterReadingGetPayload<null>) =>
        WaterMeterReading.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<WaterMeterReading>> {
    return this.tableBuilder.findForTable(params)
  }

  async findById(id: Id) {
    const dto = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    if (!dto) return undefined
    return WaterMeterReading.fromDto(this.fromPrismaPayload(dto))
  }

  async findLastReading(id: Id) {
    const reading = await this.getModel().findFirst({
      where: { waterMeterId: id.toString() },
      orderBy: { readingDate: 'desc' }
    })
    if (!reading) return undefined
    return WaterMeterReading.fromDto(this.fromPrismaPayload(reading))
  }

  async save(reading: WaterMeterReading) {
    const update = {
      waterMeterId: reading.waterMeterId.toString(),
      reading: new Prisma.Decimal(reading.reading.toString()), // Prisma.Decimal
      normalizedReading: reading.normalizedReading,
      readingDate: reading.readingDate,
      notes: reading.notes ?? null
    }

    await this.getModel().upsert({
      where: {
        id: reading.id.toString()
      },
      create: {
        ...update,
        id: reading.id.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(dto: Prisma.WaterMeterReadingGetPayload<null>): WaterMeterReadingDto {
    return {
      id: dto.id,
      waterMeterId: dto.waterMeterId,
      reading: dto.reading.toString(), // Prisma.Decimal as string
      normalizedReading: dto.normalizedReading,
      readingDate: dto.readingDate,
      notes: dto.notes
    }
  }
}
