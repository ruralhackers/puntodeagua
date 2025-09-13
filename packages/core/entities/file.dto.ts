import { idSchema } from 'core'
import { z } from 'zod'

export type FileDto = z.infer<typeof fileSchema>

export const fileSchema = z.object({
  id: idSchema,
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().positive(),
  url: z.string(),
  bucket: z.string(),
  key: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  uploadedBy: idSchema,
  createdAt: z.date().default(() => new Date())
})
