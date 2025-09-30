import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { Analysis } from '../../domain/entities/analysis'
import type { AnalysisRepository } from '../../domain/repositories/analysis.repository'
import { analysisTableConfig } from './analysis-table-config'

export class AnalysisPrismaRepository extends BasePrismaRepository implements AnalysisRepository {
  protected readonly model = 'analysis'
  private readonly tableBuilder: PrismaTableQueryBuilder<Analysis, Analysis>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...analysisTableConfig,
      entityFromDto: (dto: Prisma.AnalysisGetPayload<null>) =>
        Analysis.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<Analysis>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<Analysis[]> {
    const analysiss = await this.getModel().findMany()
    return analysiss.map((analysis) => Analysis.fromDto(this.fromPrismaPayload(analysis)))
  }

  async findById(id: Id) {
    const analysis = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return analysis ? Analysis.fromDto(this.fromPrismaPayload(analysis)) : undefined
  }

  async findByCommunityId(communityId: Id) {
    const analyses = await this.getModel().findMany({
      where: { communityId: communityId.toString() },
      orderBy: { analyzedAt: 'desc' }
    })
    return analyses.map((analysis) => Analysis.fromDto(this.fromPrismaPayload(analysis)))
  }

  async save(analysis: Analysis) {
    const update = {
      communityId: analysis.communityId.toString(),
      analysisType: analysis.analysisType.toString(),
      analyst: analysis.analyst,
      analyzedAt: analysis.analyzedAt,
      ph: analysis.ph?.toString(),
      turbidity: analysis.turbidity?.toString(),
      chlorine: analysis.chlorine?.toString(),
      description: analysis.description ?? undefined,
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: {
        id: analysis.id.toString()
      },
      create: {
        ...update,
        id: analysis.id.toString(),
        communityId: analysis.communityId.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.AnalysisGetPayload<null>) {
    return {
      ...payload,
      communityZoneId: payload.communityZoneId ?? undefined,
      waterDepositId: payload.waterDepositId ?? undefined,
      ph: payload.ph ? Number(payload.ph) : undefined,
      turbidity: payload.turbidity ? Number(payload.turbidity) : undefined,
      chlorine: payload.chlorine ? Number(payload.chlorine) : undefined,
      description: payload.description ?? undefined
    }
  }
}
