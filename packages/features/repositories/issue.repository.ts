import type { Savable } from 'core'
import type { Issue } from '../entities/issue.ts'

export interface IssueRepository extends Savable<Issue> {}
