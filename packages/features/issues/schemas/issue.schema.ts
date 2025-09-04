import { idSchema } from 'core'
import { z } from 'zod'

export type IssueSchema = z.infer<typeof issueSchema>

export const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  reporterName: z.string(),
  waterZoneId: idSchema,
  status: z.string()
})
