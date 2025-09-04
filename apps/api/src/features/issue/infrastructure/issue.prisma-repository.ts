import type { PrismaClient } from 'database'
import { BasePrismaRepository, Issue } from 'features'
import { IssueRepository } from 'features/repositories/issue.repository'

export class IssuePrismaRepository extends BasePrismaRepository implements IssueRepository {
  protected readonly model = 'issue'
  protected getModel(): PrismaClient['issue'] {
    return this.db.issue
  }

  async save(input: Issue): Promise<void> {
    const issueData = {
      id: input.id.toString(),
      name: input.name
    }

    await this.getModel().upsert({
      where: { id: input.id.toString() },
      create: {
        ...issueData
      }
    })
  }
}
