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
      entityFromDto: (dto: Prisma.WaterMeterGetPayload<null>) => {
        // For table queries, we don't need the waterPoint, so we create a minimal one
        const minimalWaterPoint = {
          id: dto.waterPointId,
          name: 'Unknown',
          location: 'Unknown',
          fixedPopulation: 0,
          floatingPopulation: 0,
          cadastralReference: 'Unknown',
          communityZoneId: 'unknown',
          notes: undefined
        }
        return WaterMeter.fromDto({
          ...dto,
          waterPoint: minimalWaterPoint
        })
      }
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig as any, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<WaterMeter>> {
    return this.tableBuilder.findForTable(params)
  }

  async findById(id: Id) {
    const meter = await this.getModel().findUnique({
      where: { id: id.toString() },
      include: {
        waterPoint: {
          select: {
            id: true,
            name: true,
            location: true,
            fixedPopulation: true,
            floatingPopulation: true,
            cadastralReference: true,
            communityZoneId: true,
            notes: true
          }
        }
      }
    })
    if (!meter) return undefined

    const dto = {
      id: meter.id,
      name: meter.name,
      waterAccountId: meter.waterAccountId,
      measurementUnit: meter.measurementUnit,
      lastReadingNormalizedValue: meter.lastReadingNormalizedValue,
      lastReadingDate: meter.lastReadingDate,
      lastReadingExcessConsumption: meter.lastReadingExcessConsumption,
      isActive: meter.isActive,
      waterPoint: {
        id: meter.waterPoint.id,
        name: meter.waterPoint.name,
        location: meter.waterPoint.location,
        fixedPopulation: meter.waterPoint.fixedPopulation,
        floatingPopulation: meter.waterPoint.floatingPopulation,
        cadastralReference: meter.waterPoint.cadastralReference,
        communityZoneId: meter.waterPoint.communityZoneId,
        notes: meter.waterPoint.notes
      }
    }
    return WaterMeter.fromDto(dto)
  }

  async findByWaterPointId(id: Id) {
    const meters = await this.getModel().findMany({
      where: { waterPointId: id.toString() },
      include: {
        waterPoint: {
          select: {
            id: true,
            name: true,
            location: true,
            fixedPopulation: true,
            floatingPopulation: true,
            cadastralReference: true,
            communityZoneId: true,
            notes: true
          }
        }
      }
    })
    return meters.map((meter) => {
      const dto = {
        id: meter.id,
        name: meter.name,
        waterAccountId: meter.waterAccountId,
        measurementUnit: meter.measurementUnit,
        lastReadingNormalizedValue: meter.lastReadingNormalizedValue,
        lastReadingDate: meter.lastReadingDate,
        lastReadingExcessConsumption: meter.lastReadingExcessConsumption,
        isActive: meter.isActive,
        waterPoint: {
          id: meter.waterPoint.id,
          name: meter.waterPoint.name,
          location: meter.waterPoint.location,
          fixedPopulation: meter.waterPoint.fixedPopulation,
          floatingPopulation: meter.waterPoint.floatingPopulation,
          cadastralReference: meter.waterPoint.cadastralReference,
          communityZoneId: meter.waterPoint.communityZoneId,
          notes: meter.waterPoint.notes
        }
      }
      return WaterMeter.fromDto(dto)
    })
  }

  async save(zone: WaterMeter) {
    const update = {
      name: zone.name,
      measurementUnit: zone.measurementUnit.toString(),
      lastReadingNormalizedValue: zone.lastReadingNormalizedValue ?? null,
      lastReadingDate: zone.lastReadingDate ?? null,
      lastReadingExcessConsumption: zone.lastReadingExcessConsumption ?? null,
      waterAccountId: zone.waterAccountId.toString(),
      waterPointId: zone.waterPoint.id.toString()
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

  async findActiveByCommunityZonesIdOrderedByLastReading(zonesIds: Id[]): Promise<WaterMeter[]> {
    const whereClause =
      zonesIds.length === 0
        ? { isActive: true }
        : {
            isActive: true,
            waterPoint: {
              communityZoneId: { in: zonesIds.map((id) => id.toString()) }
            }
          }

    const meters = await this.getModel().findMany({
      where: whereClause,
      include: {
        waterPoint: {
          select: {
            id: true,
            name: true,
            location: true,
            fixedPopulation: true,
            floatingPopulation: true,
            cadastralReference: true,
            communityZoneId: true,
            notes: true
          }
        }
      },
      orderBy: {
        lastReadingDate: 'asc'
      }
    })

    return meters.map((meter) => {
      const dto = {
        id: meter.id,
        name: meter.name,
        waterAccountId: meter.waterAccountId,
        measurementUnit: meter.measurementUnit,
        lastReadingNormalizedValue: meter.lastReadingNormalizedValue,
        lastReadingDate: meter.lastReadingDate,
        lastReadingExcessConsumption: meter.lastReadingExcessConsumption,
        isActive: meter.isActive,
        waterPoint: {
          id: meter.waterPoint.id,
          name: meter.waterPoint.name,
          location: meter.waterPoint.location,
          fixedPopulation: meter.waterPoint.fixedPopulation,
          floatingPopulation: meter.waterPoint.floatingPopulation,
          cadastralReference: meter.waterPoint.cadastralReference,
          communityZoneId: meter.waterPoint.communityZoneId,
          notes: meter.waterPoint.notes
        }
      }
      return WaterMeter.fromDto(dto)
    })
  }
}
