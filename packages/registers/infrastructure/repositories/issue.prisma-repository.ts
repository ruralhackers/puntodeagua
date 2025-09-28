import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { Issue } from '../../domain/entities/issue'
import type { IssueRepository } from '../../domain/repositories/issue.repository'
import { issueTableConfig } from './issue-table-config'

export class IssuePrismaRepository extends BasePrismaRepository implements IssueRepository {
  protected readonly model = 'issue'
  private readonly tableBuilder: PrismaTableQueryBuilder<Issue, Issue>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...issueTableConfig,
      entityFromDto: (dto: Prisma.IssueGetPayload<null>) =>
        Issue.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<Issue>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<Issue[]> {
    const issues = await this.getModel().findMany()
    return issues.map((issue) => Issue.fromDto(this.fromPrismaPayload(issue)))
  }

  async findById(id: Id) {
    const issue = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return issue ? Issue.fromDto(this.fromPrismaPayload(issue)) : undefined
  }

  async findByCommunityId(communityId: Id) {
    const issues = await this.getModel().findMany({
      where: { communityId: communityId.toString() },
      orderBy: { startAt: 'desc' }
    })
    return issues.map((issue) => Issue.fromDto(this.fromPrismaPayload(issue)))
  }

  async save(issue: Issue) {
    const update = {
      title: issue.title,
      reporterName: issue.reporterName,
      waterZoneId: issue.waterZoneId?.toString(),
      waterDepositId: issue.waterDepositId?.toString(),
      waterPointId: issue.waterPointId?.toString(),
      description: issue.description ?? undefined,
      status: issue.status.toString(),
      startAt: issue.startAt,
      endAt: issue.endAt ? issue.endAt : undefined,
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: {
        id: issue.id.toString()
      },
      create: {
        ...update,
        id: issue.id.toString(),
        communityId: issue.communityId.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.IssueGetPayload<null>) {
    return {
      ...payload,
      waterZoneId: payload.waterZoneId ?? undefined,
      waterDepositId: payload.waterDepositId ?? undefined,
      waterPointId: payload.waterPointId ?? undefined,
      endAt: payload.endAt ? payload.endAt : undefined,
      description: payload.description ?? undefined
    }
  }
}
