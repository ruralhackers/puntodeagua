import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

export const incidentImageSchema = z.object({
  id: idSchema,
  incidentId: idSchema,
  url: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  uploadedAt: z.date(),
  externalKey: z.string()
})

export type IncidentImageDto = z.infer<typeof incidentImageSchema>
