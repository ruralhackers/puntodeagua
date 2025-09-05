import type { FindableAll, FindableById, Savable } from 'core'
import type { Issue } from '../entities/issue.ts'
import type { IssueRepositoryFilters } from './issue.repository-filters.ts'

export interface IssueRepository
  extends Savable<Issue>,
    FindableAll<Issue, IssueRepositoryFilters>,
    FindableById<Issue> {}
