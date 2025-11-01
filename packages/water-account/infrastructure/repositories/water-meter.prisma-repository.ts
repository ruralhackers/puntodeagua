import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { WaterMeter } from '../../domain/entities/water-meter'
import type { WaterMeterDisplayDto } from '../../domain/entities/water-meter-display.dto'
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
          waterDepositIds: [],
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
            waterDepositIds: true,
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
        waterDepositIds: meter.waterPoint.waterDepositIds,
        notes: meter.waterPoint.notes
      }
    }
    return WaterMeter.fromDto(dto)
  }

  async findByIdForDisplay(id: Id): Promise<WaterMeterDisplayDto | undefined> {
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
            waterDepositIds: true,
            notes: true
          }
        },
        waterAccount: {
          select: {
            id: true,
            name: true
          }
        },
        waterMeterImage: true
      }
    })
    if (!meter) return undefined

    return {
      id: meter.id,
      waterAccountId: meter.waterAccountId,
      waterAccountName: meter.waterAccount.name,
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
        waterDepositIds: meter.waterPoint.waterDepositIds,
        notes: meter.waterPoint.notes
      },
      waterMeterImage: meter.waterMeterImage || null
    }
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
            waterDepositIds: true,
            notes: true
          }
        }
      }
    })
    // biome-ignore lint/suspicious/noExplicitAny: Prisma return type is complex
    return meters.map((meter: any) => {
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
          waterDepositIds: meter.waterPoint.waterDepositIds,
          notes: meter.waterPoint.notes
        }
      }
      return WaterMeter.fromDto(dto)
    })
  }

  async findByWaterPointIdForDisplay(id: Id): Promise<WaterMeterDisplayDto[]> {
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
            waterDepositIds: true,
            notes: true
          }
        },
        waterAccount: {
          select: {
            id: true,
            name: true
          }
        },
        waterMeterImage: true
      }
    })
    // biome-ignore lint/suspicious/noExplicitAny: Prisma return type is complex
    return meters.map((meter: any) => ({
      id: meter.id,
      waterAccountId: meter.waterAccountId,
      waterAccountName: meter.waterAccount.name,
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
        waterDepositIds: meter.waterPoint.waterDepositIds,
        notes: meter.waterPoint.notes
      },
      waterMeterImage: meter.waterMeterImage || null
    }))
  }

  async save(zone: WaterMeter) {
    const update = {
      name: zone.name,
      measurementUnit: zone.measurementUnit.toString(),
      lastReadingNormalizedValue: zone.lastReadingNormalizedValue ?? null,
      lastReadingDate: zone.lastReadingDate ?? null,
      lastReadingExcessConsumption: zone.lastReadingExcessConsumption ?? null,
      waterAccountId: zone.waterAccountId.toString(),
      waterPointId: zone.waterPoint.id.toString(),
      isActive: zone.isActive
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

  async findByCommunityZonesIdOrderedByLastReading(
    zonesIds: Id[]
  ): Promise<WaterMeterDisplayDto[]> {
    const whereClause =
      zonesIds.length === 0
        ? {}
        : {
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
            waterDepositIds: true,
            notes: true
          }
        },
        waterAccount: {
          select: {
            id: true,
            name: true
          }
        },
        waterMeterImage: true
      },
      orderBy: {
        lastReadingDate: 'asc'
      }
    })

    // biome-ignore lint/suspicious/noExplicitAny: Prisma return type is complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return meters.map((meter: any) => ({
      id: meter.id,
      waterAccountId: meter.waterAccountId,
      waterAccountName: meter.waterAccount.name,
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
        waterDepositIds: meter.waterPoint.waterDepositIds,
        notes: meter.waterPoint.notes
      },
      waterMeterImage: meter.waterMeterImage || null
    }))
  }

  async findActiveByCommunityZonesIdOrderedByLastReading(
    zonesIds: Id[]
  ): Promise<WaterMeterDisplayDto[]> {
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
            waterDepositIds: true,
            notes: true
          }
        },
        waterAccount: {
          select: {
            id: true,
            name: true
          }
        },
        waterMeterImage: true
      },
      orderBy: {
        lastReadingDate: 'asc'
      }
    })

    // biome-ignore lint/suspicious/noExplicitAny: Prisma return type is complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return meters.map((meter: any) => ({
      id: meter.id,
      waterAccountId: meter.waterAccountId,
      waterAccountName: meter.waterAccount.name,
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
        waterDepositIds: meter.waterPoint.waterDepositIds,
        notes: meter.waterPoint.notes
      },
      waterMeterImage: meter.waterMeterImage || null
    }))
  }
}
