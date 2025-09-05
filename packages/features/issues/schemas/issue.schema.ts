import { idSchema } from 'core'
import { z } from 'zod'

export type IssueSchema = z.infer<typeof issueSchema>

export const issueSchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string().optional(),
  reporterName: z.string(),
  status: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().optional(),
  waterZoneId: idSchema
})
