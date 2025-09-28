import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { IssueStatusType } from '../value-objects/issue-status-type'

export type IssueDto = z.infer<typeof issueSchema>

export const issueSchema = z.object({
  id: idSchema,
  title: z.string(),
  reporterName: z.string(),
  startAt: z.date(),
  communityId: idSchema,
  status: z.enum(IssueStatusType.values() as [string, ...string[]]),
  waterZoneId: idSchema.optional(),
  waterDepositId: idSchema.optional(),
  waterPointId: idSchema.optional(),
  endAt: z.date().optional(),
  description: z.string().max(2000).optional()
})
