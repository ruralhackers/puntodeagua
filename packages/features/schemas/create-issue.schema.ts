import type { z } from 'zod'
import { issueSchema } from '../issues/schemas/issue.schema.ts'

export type CreateIssueSchema = z.infer<typeof createIssueSchema>

export const createIssueSchema = issueSchema.omit({
  id: true
})
