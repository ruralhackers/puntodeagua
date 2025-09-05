import type { Issue } from 'features'
import type { IssueRepository } from 'features/issues/repositories/issue.repository'

export interface IssueApiRepository extends IssueRepository {
  findAllOrderedByEndAt(startDate?: Date, endDate?: Date): Promise<Issue[]>
}
