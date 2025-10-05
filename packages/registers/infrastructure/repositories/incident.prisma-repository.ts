import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { Incident } from '../../domain/entities/incident'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'
import { incidentTableConfig } from './incident-table-config'

export class IncidentPrismaRepository extends BasePrismaRepository implements IncidentRepository {
  protected readonly model = 'incident'
  private readonly tableBuilder: PrismaTableQueryBuilder<Incident, Incident>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...incidentTableConfig,
      entityFromDto: (dto: Prisma.IncidentGetPayload<null>) =>
        Incident.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<Incident>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<Incident[]> {
    const incidents = await this.getModel().findMany()
    return incidents.map((incident) => Incident.fromDto(this.fromPrismaPayload(incident)))
  }

  async findById(id: Id) {
    const incident = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return incident ? Incident.fromDto(this.fromPrismaPayload(incident)) : undefined
  }

  async findByCommunityId(communityId: Id) {
    const incidents = await this.getModel().findMany({
      where: { communityId: communityId.toString() },
      orderBy: { startAt: 'desc' }
    })
    return incidents.map((incident) => Incident.fromDto(this.fromPrismaPayload(incident)))
  }

  async findByFilters(filters: {
    communityId: Id
    startDate?: Date
    endDate?: Date
    status?: 'open' | 'closed'
  }) {
    const where: Prisma.IncidentWhereInput = {
      communityId: filters.communityId.toString()
    }

    // Add date range filter
    if (filters.startDate || filters.endDate) {
      where.startAt = {}
      if (filters.startDate) {
        where.startAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.startAt.lte = filters.endDate
      }
    }

    // Add status filter
    if (filters.status) {
      where.status = filters.status
    }

    const incidents = await this.getModel().findMany({
      where,
      orderBy: { startAt: 'desc' }
    })
    console.log({ incidents, where })

    return incidents.map((incident) => Incident.fromDto(this.fromPrismaPayload(incident)))
  }

  async save(incident: Incident) {
    const update = {
      title: incident.title,
      reporterName: incident.reporterName,
      communityZoneId: incident.communityZoneId?.toString(),
      waterDepositId: incident.waterDepositId?.toString(),
      waterPointId: incident.waterPointId?.toString(),
      description: incident.description ?? undefined,
      closingDescription: incident.closingDescription ?? undefined,
      status: incident.status.toString(),
      startAt: incident.startAt,
      endAt: incident.endAt ? incident.endAt : undefined,
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: {
        id: incident.id.toString()
      },
      create: {
        ...update,
        id: incident.id.toString(),
        communityId: incident.communityId.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.IncidentGetPayload<Record<string, never>>) {
    return {
      ...payload,
      communityZoneId: payload.communityZoneId ?? undefined,
      waterDepositId: payload.waterDepositId ?? undefined,
      waterPointId: payload.waterPointId ?? undefined,
      endAt: payload.endAt ? payload.endAt : undefined,
      description: payload.description ?? undefined,
      closingDescription: payload.closingDescription ?? undefined
    }
  }
}
