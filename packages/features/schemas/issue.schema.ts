import { z } from 'zod'

export type IssueSchema = z.infer<typeof issueSchema>

export const issueSchema = z.object({
  name: z.string()
})
