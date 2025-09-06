import type { Id } from 'core'
import type { Prisma, PrismaClient } from 'database'
import { Analysis, type AnalysisRepository, BasePrismaRepository } from 'features'

export class AnalysisPrismaRepository extends BasePrismaRepository implements AnalysisRepository {
  protected readonly model = 'analysis'
  protected getModel(): PrismaClient['analysis'] {
    return this.db.analysis
  }

  async save(input: Analysis): Promise<void> {
    const update = {
      waterZoneId: input.waterZoneId.toString(),
      analysisType: input.analysisType.toString(),
      analyst: input.analyst,
      analyzedAt: input.analyzedAt,
      ph: input.ph?.toString(),
      turbidity: input.turbidity?.toString(),
      chlorine: input.chlorine?.toString(),
      description: input.description ?? undefined
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

  async findById(id: Id): Promise<Analysis | undefined> {
    const entityDto = await this.getModel().findUnique({ where: { id: id.toString() } })
    return entityDto ? Analysis.fromDto(this.fromPrismaPayload(entityDto)) : undefined
  }

  async findAll(): Promise<Analysis[]> {
    const entityDtos = await this.getModel().findMany()
    return entityDtos.map((c) => Analysis.fromDto(this.fromPrismaPayload(c)))
  }

  async findAllOrderedByAnalyzedAt(communityId: Id): Promise<Analysis[]> {
    const entityDtos = await this.getModel().findMany({
      where: {
        communityId: communityId
      },
      orderBy: { analyzedAt: 'asc' }
    })
    return entityDtos.map((c) => Analysis.fromDto(this.fromPrismaPayload(c)))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  private fromPrismaPayload(input: Prisma.AnalysisGetPayload<true>) {
    return {
      id: input.id.toString(),
      waterZoneId: input.waterZoneId.toString(),
      analysisType: input.analysisType.toString(),
      analyst: input.analyst,
      analyzedAt: input.analyzedAt,
      ph: input.ph?.toString(),
      turbidity: input.turbidity?.toString(),
      chlorine: input.chlorine?.toString(),
      description: input.description ?? undefined
    }
  }
}
