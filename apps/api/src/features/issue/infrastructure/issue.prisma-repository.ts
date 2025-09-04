import type { Prisma, PrismaClient } from 'database'
import { BasePrismaRepository, type Issue } from 'features'
import type { IssueRepository } from 'features/repositories/issue.repository'

export class IssuePrismaRepository extends BasePrismaRepository implements IssueRepository {
  protected readonly model = 'issue'
  protected getModel(): PrismaClient['issue'] {
    return this.db.issue
  }

  async save(input: Issue): Promise<void> {
    const update = {
      waterZoneId: input.waterZoneId.toString(),
      name: input.title
    }

    const create = {
      ...update,
      id: input.id.toString(),
      title: '',
      reporterName: '',
      reporterEmail: '',
      description: '',
      status: 'OPEN',
      priority: 'LOW',
      startAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create,
      update
    })
  }

  private fromPrismaPayload(input: Prisma.IssueGetPayload<true>) {
    return {
      id: input.id.toString(),
      name: input.title,
      waterZoneId: input.waterZoneId.toString()
    }
  }
}
