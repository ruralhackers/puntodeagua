import type { IssueStatusType } from '../value-objects/issue-status-type.ts'

export interface IssueRepositoryFilters {
  status: IssueStatusType
}
