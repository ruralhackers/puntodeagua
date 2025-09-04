import { z } from 'zod'

export type CreateIssueSchema = z.infer<typeof createIssueSchema>

export const createIssueSchema = z.object({
  name: z.string()
})
