import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { IncidentStatusType } from '../value-objects/incident-status-type'

export type IncidentDto = z.infer<typeof incidentSchema>

export const incidentSchema = z.object({
  id: idSchema,
  title: z.string(),
  reporterName: z.string(),
  startAt: z.date(),
  communityId: idSchema,
  status: z.enum(IncidentStatusType.values() as [string, ...string[]]),
  communityZoneId: idSchema.optional(),
  waterDepositId: idSchema.optional(),
  waterPointId: idSchema.optional(),
  endAt: z.date().optional(),
  description: z.string().max(2000).optional(),
  closingDescription: z.string().max(2000).optional()
})

export const incidentUpdateSchema = z.object({
  status: z.enum(IncidentStatusType.values() as [string, ...string[]]),
  endAt: z.date().optional(),
  description: z.string().max(2000).optional(),
  closingDescription: z.string().max(2000).optional()
})

export type IncidentUpdateDto = z.infer<typeof incidentUpdateSchema>
