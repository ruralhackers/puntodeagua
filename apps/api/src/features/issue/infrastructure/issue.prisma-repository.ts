import { DateTime, type Id } from 'core'
import type { Prisma, PrismaClient } from 'database'
import {
  BasePrismaRepository,
  Issue,
  type IssueRepositoryFilters,
  type IssueSchema
} from 'features'
import type { IssueApiRepository } from '../domain/issue.api-repository'

export class IssuePrismaRepository extends BasePrismaRepository implements IssueApiRepository {
  protected readonly model = 'issue'
  protected getModel(): PrismaClient['issue'] {
    return this.db.issue
  }

  async save(input: Issue): Promise<void> {
    const update = {
      waterZoneId: input.waterZoneId.toString(),
      title: input.title,
      reporterName: input.reporterName,
      description: input.description,
      status: input.status.toString(),
      startAt: input.startAt.toDate(),
      endAt: input.endAt ? input.endAt.toDate() : undefined
    }

    const create = {
      ...update,
      id: input.id.toString()
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create,
      update
    })
  }

  async findById(id: Id): Promise<Issue | undefined> {
    const entityDto = await this.getModel().findUnique({ where: { id: id.toString() } })
    return entityDto ? Issue.fromDto(this.fromPrismaPayload(entityDto)) : undefined
  }

  async findAll(filters?: IssueRepositoryFilters): Promise<Issue[]> {
    const entityDtos = await this.getModel().findMany({
      where: {
        ...(filters?.status && { status: filters.status.toString() })
      },
      orderBy: { startAt: 'asc' }
    })
    return entityDtos.map((c) => Issue.fromDto(this.fromPrismaPayload(c)))
  }

  async findAllOrderedByEndAt(startDate?: Date, endDate?: Date): Promise<Issue[]> {
    const where =
      startDate && endDate
        ? {
            endAt: {
              gte: startDate,
              lt: endDate
            }
          }
        : undefined

    const entityDtos = await this.getModel().findMany({
      where,
      orderBy: { endAt: 'asc' }
    })
    return entityDtos.map((c) => Issue.fromDto(this.fromPrismaPayload(c)))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  private fromPrismaPayload(input: Prisma.IssueGetPayload<true>): IssueSchema {
    return {
      id: input.id.toString(),
      title: input.title,
      waterZoneId: input.waterZoneId.toString(),
      reporterName: input.reporterName,
      description: input.description ?? undefined,
      status: input.status,
      startAt: DateTime.fromDate(input.startAt).toISO(),
      endAt: input.endAt ? DateTime.fromDate(input.endAt).toISO() : undefined
    }
  }
}
