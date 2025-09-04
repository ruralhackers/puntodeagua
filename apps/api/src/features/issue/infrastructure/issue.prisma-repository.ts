import type { Id } from 'core'
import type { Prisma, PrismaClient } from 'database'
import { BasePrismaRepository, Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'

export class IssuePrismaRepository extends BasePrismaRepository implements IssueRepository {
  protected readonly model = 'issue'
  protected getModel(): PrismaClient['issue'] {
    return this.db.issue
  }

  async save(input: Issue): Promise<void> {
    const update = {
      waterZoneId: input.waterZoneId.toString(),
      title: input.title
    }

    const create = {
      ...update,
      id: input.id.toString(),
      reporterName: '',
      description: '',
      status: 'OPEN',
      startAt: new Date(),
      endAt: new Date()
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

  async findAll(): Promise<Issue[]> {
    const entityDtos = await this.getModel().findMany()
    return entityDtos.map((c) => Issue.fromDto(this.fromPrismaPayload(c)))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  private fromPrismaPayload(input: Prisma.IssueGetPayload<true>) {
    return {
      id: input.id.toString(),
      title: input.title,
      waterZoneId: input.waterZoneId.toString()
    }
  }
}
