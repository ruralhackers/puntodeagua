import { z } from 'zod'

export const fileMetadataSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  originalName: z.string().min(1)
})

export type FileMetadataDto = z.infer<typeof fileMetadataSchema>

