import type { FindableAll, FindableById, Savable } from 'core'
import type { Issue } from '../entities/issue.ts'

export interface IssueRepository extends Savable<Issue>, FindableAll<Issue>, FindableById<Issue> {
  findAllOrderedByEndAt(): Promise<Issue[]>
}
