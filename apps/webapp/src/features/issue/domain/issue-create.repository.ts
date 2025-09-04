import type { IssueRepository } from 'features/issues/repositories/issue.repository'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'

export interface IssueCreateRepository extends IssueRepository {
  create(data: CreateIssueSchema): Promise<void>
}
