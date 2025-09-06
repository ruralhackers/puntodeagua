import { idSchema } from 'core'
import z from 'zod'

export type MaintenanceSchema = z.infer<typeof maintenanceSchema>

export const maintenanceSchema = z.object({
  id: idSchema,
  name: z.string(),
  waterZoneId: idSchema,
  communityId: idSchema,
  scheduledDate: z.date(),
  executionDate: z.date().optional(),
  responsible: z.string(),
  duration: z.number().optional(),
  nextMaintenanceDate: z.date().optional(),
  description: z.string().optional(),
  observations: z.string().optional()
})
